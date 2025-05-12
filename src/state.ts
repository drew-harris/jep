import { create } from "zustand";

type Question = {
  worth: number;
  questionText: string;
  answerText: string;
  category: string;
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
