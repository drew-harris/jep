import type { Message, MessageType } from "./types";

type SpecificMessageHandler<T extends MessageType> = (
  data: Message<T>["data"], // The message type is now specifically Message<T>
  broadcast: <B extends MessageType>(
    type: B,
    data: Message<B>["data"],
    inclusive?: true,
  ) => void,
  socket: Bun.ServerWebSocket<unknown>,
) => void;

type HandlersMap = {
  [K in MessageType]: SpecificMessageHandler<K>;
};

export const handlers: Partial<HandlersMap> = {
  buzzAccept: (m, b) => {
    console.log("buzzAccept", m);
    setTimeout(() => {
      b("join", { name: "drew" });
    }, 4000);
  },
};
