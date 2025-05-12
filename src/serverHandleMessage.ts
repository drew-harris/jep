import { game, resetGame } from "./state";
import type { Message, MessageType } from "./types";

type SpecificMessageHandler<T extends MessageType> = (
  data: Message<T>["data"],
  broadcast: <B extends MessageType>(
    type: B,
    data: Message<B>["data"],
    inclusive?: true,
  ) => void,
  spread: () => void,
  socket: Bun.ServerWebSocket<unknown>,
) => void;

type HandlersMap = {
  [K in MessageType]: SpecificMessageHandler<K>;
};

export const handlers: Partial<HandlersMap> = {
  sync: (m, b) => {
    // Sync to to others (rare)
    b("sync", game.getState());
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
  setViewingQuestion: (m, b, spread) => {
    spread();
    game.setState(() => ({
      currentQuestion: m.question,
    }));
    b("sync", game.getState(), true);
  },
};
