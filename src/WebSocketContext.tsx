import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import type { Message, MessageType } from "./types";

type MessageListenerCallback = (data: any) => void;
type GenericMessageListenerCallback<T extends MessageType> = (
  message: Message<T>,
) => void;

interface WebSocketContextType {
  sendMessage: <T extends MessageType>(
    type: T,
    data: Message<T>["data"],
  ) => void;
  addMessageListener: (
    type: string | null,
    callback: MessageListenerCallback | GenericMessageListenerCallback<any>,
  ) => () => void; // Returns an unsubscribe function
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

// --- Provider Props ---
interface WebSocketProviderProps {
  url: string;
  reconnectInterval?: number; // in milliseconds
  children: ReactNode;
}

// --- Provider Component ---
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  url,
  reconnectInterval = 5000,
  children,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Store listeners: key is message type (or a special key for "all"), value is a Set of callbacks
  const listenersRef = useRef<
    Map<
      string | null,
      Set<MessageListenerCallback | GenericMessageListenerCallback<any>>
    >
  >(new Map());

  const connect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket already open");
      return;
    }

    console.log(`Attempting to connect to WebSocket: ${url}`);
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket connected to ${url}`);
      setIsConnected(true);
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      // Optionally, send queued messages here if you implement a queue
    };

    ws.onmessage = (event) => {
      try {
        const message: Message<any> = JSON.parse(event.data as string);
        console.log("WebSocket message received:", message);

        // Notify generic listeners (listening to all messages)
        const genericListeners = listenersRef.current.get(null);
        if (genericListeners) {
          genericListeners.forEach((callback) =>
            (callback as GenericMessageListenerCallback<any>)(message),
          );
        }

        // Notify type-specific listeners
        const specificListeners = listenersRef.current.get(message.type);
        if (specificListeners) {
          specificListeners.forEach((callback) =>
            (callback as MessageListenerCallback)(message.data),
          );
        }
      } catch (error) {
        console.error(
          "Failed to parse WebSocket message or notify listeners:",
          error,
        );
        console.error("Original message data:", event.data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      // ws.close() will be called automatically by the browser, triggering onclose
    };

    ws.onclose = (event) => {
      console.log(
        `WebSocket disconnected from ${url}. Clean close: ${event.wasClean}, Code: ${event.code}, Reason: ${event.reason}`,
      );
      setIsConnected(false);
      socketRef.current = null; // Clear the ref
      if (!reconnectTimerRef.current) {
        // Avoid multiple timers
        console.log(
          `Attempting to reconnect in ${reconnectInterval / 1000}s...`,
        );
        reconnectTimerRef.current = setTimeout(connect, reconnectInterval);
      }
    };
  }, [url, reconnectInterval]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (socketRef.current) {
        console.log("Closing WebSocket connection on component unmount.");
        socketRef.current.close(1000, "Component unmounting"); // 1000 is normal closure
        socketRef.current = null;
      }
      listenersRef.current.clear(); // Clear listeners on unmount
    };
  }, [connect]); // Re-run effect if `connect` (and thus `url` or `reconnectInterval`) changes

  const sendMessage = useCallback(
    <T extends MessageType>(type: T, data: Message<T>["data"]) => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        try {
          const messageString = JSON.stringify({
            type,
            data,
          });
          socketRef.current.send(messageString);
          console.log("WebSocket message sent:", data);
        } catch (error) {
          console.error("Failed to send WebSocket message:", error);
        }
      } else {
        console.warn(
          "WebSocket not connected. Message not sent:",
          data,
          // You could implement a message queue here
        );
      }
    },
    [],
  );

  const addMessageListener = useCallback(
    (
      type: string | null, // null for generic listener
      callback: MessageListenerCallback | GenericMessageListenerCallback<any>,
    ) => {
      if (!listenersRef.current.has(type)) {
        listenersRef.current.set(type, new Set());
      }
      listenersRef.current.get(type)!.add(callback);

      // Return an unsubscribe function
      return () => {
        const listeners = listenersRef.current.get(type);
        if (listeners) {
          listeners.delete(callback);
          if (listeners.size === 0) {
            listenersRef.current.delete(type);
          }
        }
      };
    },
    [],
  );

  const contextValue: WebSocketContextType = {
    sendMessage,
    addMessageListener,
    isConnected,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
type SubscribeCallback<T extends MessageType | undefined> =
  T extends MessageType
    ? GenericMessageListenerCallback<T> // If T is a specific type, expect a specific listener
    : MessageListenerCallback; // If T is undefined, expect a generic listener (can refine 'any' if context types are more specific)

export const useSubscribe = <T extends MessageType | undefined>(
  messageType: T, // If null or undefined, listens to all messages
  callback: SubscribeCallback<T>,
) => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useSubscribe must be used within a WebSocketProvider");
  }

  const { addMessageListener } = context;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Only subscribe if a callback is provided
    if (callback) {
      // If messageType is undefined, treat it as null for a generic listener
      const typeToListen = messageType === undefined ? null : messageType;

      // Add the message listener and store the unsubscribe function
      // Casting to 'any' might be necessary here depending on the exact signature of addMessageListener
      // and how SubscribeCallback aligns with it. Ideally, types are perfect.
      unsubscribe = addMessageListener(typeToListen, callback as any);
    }

    // Cleanup function: unsubscribe when the component unmounts or dependencies change
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };

    // Re-subscribe if addMessageListener function, messageType, or the callback changes
  }, [addMessageListener, messageType, callback]);

  // This hook doesn't return anything related to sending or connection status
};

// --- Send Hook ---
export const useSend = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useSend must be used within a WebSocketProvider");
  }

  // Extract only sendMessage and isConnected from the context
  const { sendMessage, isConnected } = context;

  // This hook doesn't manage any subscriptions, so no useEffect for listeners is needed here

  return { sendMessage, isConnected };
};
// --- Custom Hook ---
