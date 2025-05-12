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

type MessageListenerCallback = (message: Message<any>) => void;
type GenericMessageListenerCallback<T extends MessageType> = (
  data: Message<T>["data"],
) => void;

interface WebSocketContextType {
  sendMessage: <T extends MessageType>(
    type: T,
    data: Message<T>["data"],
  ) => void;
  addMessageListener: (
    type: string | null,
    callback: MessageListenerCallback | GenericMessageListenerCallback<any>,
  ) => () => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

interface WebSocketProviderProps {
  url: string;
  reconnectInterval?: number; // in milliseconds
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  url,
  reconnectInterval = 5000,
  children,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    };

    ws.onmessage = (event) => {
      try {
        const message: Message<any> = JSON.parse(event.data as string);
        console.log("WebSocket message received:", message);

        const genericListeners = listenersRef.current.get(null);
        if (genericListeners) {
          genericListeners.forEach((callback) =>
            (callback as GenericMessageListenerCallback<any>)(message),
          );
        }

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
    };

    ws.onclose = (event) => {
      console.log(
        `WebSocket disconnected from ${url}. Clean close: ${event.wasClean}, Code: ${event.code}, Reason: ${event.reason}`,
      );
      setIsConnected(false);
      socketRef.current = null; // Clear the ref
      if (!reconnectTimerRef.current) {
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
        socketRef.current.close(1000, "Component unmounting");
        socketRef.current = null;
      }
      listenersRef.current.clear();
    };
  }, [connect]);

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
        console.warn("WebSocket not connected. Message not sent:", data);
      }
    },
    [],
  );

  const addMessageListener = useCallback(
    (
      type: string | null,
      callback: MessageListenerCallback | GenericMessageListenerCallback<any>,
    ) => {
      if (!listenersRef.current.has(type)) {
        listenersRef.current.set(type, new Set());
      }
      listenersRef.current.get(type)!.add(callback);

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
    ? GenericMessageListenerCallback<T>
    : MessageListenerCallback;

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

    if (callback) {
      const typeToListen = messageType === undefined ? null : messageType;

      unsubscribe = addMessageListener(typeToListen, callback as any);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [addMessageListener, messageType, callback]);
};
export const useSend = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useSend must be used within a WebSocketProvider");
  }

  const { sendMessage, isConnected } = context;

  return { sendMessage, isConnected };
};
