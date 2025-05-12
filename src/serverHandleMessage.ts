import { game, resetGame } from "./state";
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
  reset: (m, b) => {
    resetGame();
    b("sync", game.getState(), true);
  },
  incrementCount: (m, b) => {
    game.setState((state) => ({
      count: state.count + 1,
    }));
    b("sync", game.getState(), true);
  },
};
