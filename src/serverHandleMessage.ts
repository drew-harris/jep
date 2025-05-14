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

  signUp: (m, b) => {
    // double check that team doesn't exist
    const state = game.getState();
    if (state.scores[m.teamName]) {
      return;
    }
    game.setState((state) => ({
      scores: {
        ...state.scores,
        [m.teamName]: 0,
      },
    }));
  },

  allowBuzz: (m) => {
    game.setState(() => ({
      allowBuzz: m.allowed,
    }));
  },

  buzzIn: (m, b) => {
    if (!m.teamName) {
      return;
    }
    if (!game.getState().allowBuzz) {
      return;
    }

    game.setState({
      allowBuzz: false,
    });

    b("buzzAccepted", { teamName: m.teamName }, true);
  },

  startTimer: (m, b) => {
    b("startTimer", { seconds: m.seconds }, true);
  },
  stopTimer: (_, b) => {
    b("stopTimer", {}, true);
  },
  clearBuzz: (_, b) => {
    game.setState({ allowBuzz: false });
    b("clearBuzz", {}, true);
  },

  awardPoints: (m, b) => {
    game.setState((state) => {
      if (state.scores[m.teamName] === undefined) {
        return state;
      }
      const newScore = state.scores[m.teamName]! + m.amount;
      return {
        ...state,
        scores: {
          ...state.scores,
          [m.teamName]: newScore,
        },
      };
    });
    b("awardPoints", { teamName: m.teamName, amount: m.amount }, true);
  },

  deductPoints: (m, b) => {
    game.setState((state) => {
      if (state.scores[m.teamName] === undefined) {
        return state;
      }
      const newScore = state.scores[m.teamName]! - m.amount;
      return {
        ...state,
        scores: {
          ...state.scores,
          [m.teamName]: newScore,
        },
      };
    });
    b("deductPoints", { teamName: m.teamName, amount: m.amount }, true);
  },

  setShowCode: (m, b) => {
    game.setState((state) => ({
      ...state,
      showingCode: m.showCode,
    }));
  },

  removeTeam: (m, b) => {
    // @ts-ignore
    game.setState((state) => ({
      ...state,
      scores: {
        ...state.scores,
        [m.teamName]: undefined,
      },
    }));
  },
};
