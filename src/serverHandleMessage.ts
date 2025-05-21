import { game, resetGame, initialState } from "./state"; // Added initialState for reset
import type { Message, MessageType } from "./types";
import { db } from "./db";
import { gameState as gameStateTable, questions as questionsTable } from "./db/schema";
import { eq, isNull, sql } from "drizzle-orm";

type SpecificMessageHandler<T extends MessageType> = (
  data: Message<T>["data"],
  broadcast: <B extends MessageType>(
    type: B,
    data: Message<B>["data"],
    inclusive?: true,
  ) => void,
  spread: () => void,
  socket: Bun.ServerWebSocket<unknown>,
) => void | Promise<void>; // Allow handlers to be async

type HandlersMap = {
  [K in MessageType]: SpecificMessageHandler<K>;
};

export const handlers: Partial<HandlersMap> = {
  sync: (m, b) => {
    // Sync to to others (rare)
    // happens after handler
  },
  reset: async (m, b) => {
    // resetGame(); // This function from state.ts likely resets Zustand.
                  // We'll set Zustand to a known initial structure after DB ops.

    await db.update(questionsTable).set({ isAnswered: false });
    await db.update(gameStateTable).set({ 
      currentQuestionId: null, 
      scores: {}, 
      allowBuzz: false, 
      showingCode: false 
    }).where(eq(gameStateTable.id, 1));
    
    // Update Zustand store to reflect the reset state.
    // Fetch the initial questions again, or use a predefined initial structure.
    // For simplicity, using a structure similar to initial load.
    const allDbQuestions = await db.select().from(questionsTable).all();
    game.setState({
      ...initialState, // Reset to initial state structure
      questions: allDbQuestions.map(q => ({ // Repopulate questions from DB
        id: q.id,
        worth: q.worth,
        questionText: q.questionText,
        answerText: q.answerText,
        category: q.category,
        isAnswered: q.isAnswered,
      })),
      scores: {}, // Ensure scores are empty
      currentQuestion: null,
      playedQuestions: [],
      allowBuzz: false,
      showingCode: false,
    });
  },
  revealAnswer: async (m, b) => {
    const state = game.getState();
    if (!state.currentQuestion) {
      return;
    }
    const qId = state.currentQuestion.id;
    await db.update(questionsTable).set({ isAnswered: true }).where(eq(questionsTable.id, qId));
    
    // Update Zustand state
    game.setState({
      ...state,
      currentQuestion: {
        ...state.currentQuestion,
        isAnswered: true,
      },
      playedQuestions: [...state.playedQuestions, state.currentQuestion.id],
    });
  },
  unsetQuestion: async (m, b) => {
    game.setState((state) => ({
      currentQuestion: null,
    }));
    await db.update(gameStateTable).set({ currentQuestionId: null }).where(eq(gameStateTable.id, 1));
  },
  incrementCount: (m, b) => {
    // This doesn't seem to be persisted in the DB schema for gameState, so no DB op.
    game.setState((state) => ({
      count: state.count + 1,
    }));
  },
  setViewingQuestion: async (m, b, spread) => {
    spread(); // Broadcasts the original message
    game.setState(() => ({
      currentQuestion: m.question,
    }));
    if (m.question) { // Ensure question is not null
      const qId = m.question.id;
      await db.update(gameStateTable).set({ currentQuestionId: qId }).where(eq(gameStateTable.id, 1));
    } else {
      // If question is set to null, it's like unsetQuestion
      await db.update(gameStateTable).set({ currentQuestionId: null }).where(eq(gameStateTable.id, 1));
    }
  },

  signUp: async (m, b) => {
    const state = game.getState();
    if (state.scores[m.teamName]) {
      return; // Team already exists
    }
    game.setState((s) => ({ // Use 's' to avoid conflict with outer 'state'
      scores: {
        ...s.scores,
        [m.teamName]: 0,
      },
    }));
    const currentScores = game.getState().scores;
    await db.update(gameStateTable).set({ scores: currentScores }).where(eq(gameStateTable.id, 1));
  },

  allowBuzz: async (m) => {
    game.setState(() => ({
      allowBuzz: m.allowed,
    }));
    await db.update(gameStateTable).set({ allowBuzz: m.allowed }).where(eq(gameStateTable.id, 1));
  },

  buzzIn: async (m, b) => {
    if (!m.teamName) {
      return;
    }
    if (!game.getState().allowBuzz) {
      return;
    }

    game.setState({
      allowBuzz: false,
    });
    await db.update(gameStateTable).set({ allowBuzz: false }).where(eq(gameStateTable.id, 1));

    b("buzzAccepted", { teamName: m.teamName }, true);
  },

  startTimer: (m, b) => {
    // No DB state change associated
    b("startTimer", { seconds: m.seconds }, true);
  },
  stopTimer: (_, b) => {
    // No DB state change associated
    b("stopTimer", {}, true);
  },
  clearBuzz: async (_, b) => {
    game.setState({ allowBuzz: false });
    await db.update(gameStateTable).set({ allowBuzz: false }).where(eq(gameStateTable.id, 1));
    b("clearBuzz", {}, true);
  },

  awardPoints: async (m, b) => {
    game.setState((state) => {
      if (state.scores[m.teamName] === undefined) {
        return state; // Team doesn't exist
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
    const currentScores = game.getState().scores;
    await db.update(gameStateTable).set({ scores: currentScores }).where(eq(gameStateTable.id, 1));
    // Broadcast is handled by the main loop after handler execution
  },

  deductPoints: async (m, b) => {
    game.setState((state) => {
      if (state.scores[m.teamName] === undefined) {
        return state; // Team doesn't exist
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
    const currentScores = game.getState().scores;
    await db.update(gameStateTable).set({ scores: currentScores }).where(eq(gameStateTable.id, 1));
    // Broadcast is handled by the main loop
  },

  setShowCode: async (m, b) => {
    game.setState((state) => ({
      ...state,
      showingCode: m.showCode,
    }));
    await db.update(gameStateTable).set({ showingCode: m.showCode }).where(eq(gameStateTable.id, 1));
  },

  removeTeam: async (m, b) => {
    game.setState((state) => {
      const newScores = { ...state.scores };
      delete newScores[m.teamName]; // More robust way to remove a key
      return {
        ...state,
        scores: newScores,
      };
    });
    const currentScores = game.getState().scores;
    await db.update(gameStateTable).set({ scores: currentScores }).where(eq(gameStateTable.id, 1));
  },
};
