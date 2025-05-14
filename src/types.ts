import type { GameState, Question } from "./state";

export type MessageTypes = {
  reset: {};
  setViewingQuestion: {
    question: Question;
  };
  unsetQuestion: {};
  incrementCount: {};
  revealAnswer: {};
  signUp: {
    teamName: string;
  };

  allowBuzz: { allowed: boolean };
  buzzAccepted: { teamName: string };
  buzzIn: { teamName: string };
  clearBuzz: {}; // Just clears the buzz in text

  startTimer: { seconds: number };
  stopTimer: {};

  awardPoints: { teamName: string; amount: number };
  deductPoints: { teamName: string; amount: number };

  sync: GameState;

  setShowCode: { showCode: boolean };
  removeTeam: { teamName: string };
};

export type MessageType = keyof MessageTypes;
export type Message<K extends keyof MessageTypes> = {
  type: K;
  data: MessageTypes[K];
};
