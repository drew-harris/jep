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
    // happens after handler
  },
  reset: (m, b) => {
    resetGame();
  },
  revealAnswer: (m, b) => {
    const state = game.getState();
    if (!state.currentQuestion) {
      return;
    }
    game.setState({
      ...state,
      currentQuestion: {
        ...state.currentQuestion,
        isAnswered: true,
      },
      playedQuestions: [...state.playedQuestions, state.currentQuestion.id],
    });
  },
  unsetQuestion: (m, b) => {
    game.setState((state) => ({
      currentQuestion: null,
    }));
  },
  incrementCount: (m, b) => {
    game.setState((state) => ({
      count: state.count + 1,
    }));
  },
  setViewingQuestion: (m, b, spread) => {
    spread();
    game.setState(() => ({
      currentQuestion: m.question,
    }));
  },
};
