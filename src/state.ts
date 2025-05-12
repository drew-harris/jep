import { create } from "zustand";

export type Category = "Early Life" | "Music";

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
};

const initialState: GameState = {
  currentQuestion: null,
  scores: {},
  count: 0,
};

export const game = create<GameState>(() => ({
  ...(initialState satisfies GameState),
}));

export const resetGame = () => {
  game.setState(initialState);
};
