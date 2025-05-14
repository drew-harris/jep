import type { Question } from "./state";

// Comment here
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
  {
    id: "fav-color",
    worth: 300,
    category: "Music",
    answerText: "Blue",
    isAnswered: false,
    questionText: "What is my favorite color?",
  },
];
