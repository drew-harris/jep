import { create } from "zustand";

export type Category = "Before You Met Me" | "Music" | "Resume" | "Misc.";

export type Question = {
  id: string;
  worth: number;
  questionText: string;
  answerText: string;
  category: Category;
  isAnswered: boolean;
};

export type GameState = {
  currentQuestion: Question | null;
  scores: Record<string, number>;
  count: number;
  playedQuestions: string[];
  allowBuzz: boolean;
  showingCode: boolean;
};

const initialState: GameState = {
  currentQuestion: null,
  scores: {},
  playedQuestions: [],
  count: 0,
  allowBuzz: false,
  showingCode: false,
};

export const game = create<GameState>(() => ({
  ...(initialState satisfies GameState),
}));

export const resetGame = () => {
  game.setState(initialState);
};
