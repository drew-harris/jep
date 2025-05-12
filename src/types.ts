import type { GameState, Question } from "./state";

export type MessageTypes = {
  reset: {};
  setViewingQuestion: {
    question: Question;
  };
  incrementCount: {};

  sync: GameState;
};

export type MessageType = keyof MessageTypes;
export type Message<K extends keyof MessageTypes> = {
  type: K;
  data: MessageTypes[K];
};
