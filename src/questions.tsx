import type { Question } from "./state";

export const questions: Question[] = [
  {
    id: "born",
    worth: 200,
    category: "Early Life",
    answerText: "Dallas",
    isAnswered: false,
    questionText: "Where was I born?",
  },
  {
    id: "fav-artist",
    worth: 200,
    category: "Music",
    answerText: "Jane Remover",
    isAnswered: false,
    questionText: "Who is my favorite music artist?",
  },
];
