import React from "react";
import type { Question } from "./state";
import { questions } from "./questions";
import { useSend, useSubscribe } from "./WebSocketContext";
import { useNavigate } from "react-router";

// Type for the transformed data
type CategoryMap = {
  [category: string]: Question[];
};

// Function to group questions by category
const groupQuestionsByCategory = (questions: Question[]): CategoryMap => {
  return questions.reduce((acc: CategoryMap, question: Question) => {
    const { category } = question;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(question);
    return acc;
  }, {});
};

// QuestionCell Component
interface QuestionCellProps {
  question: Question;
  onQuestionClick: (question: Question) => void;
}

const QuestionCell: React.FC<QuestionCellProps> = ({
  question,
  onQuestionClick,
}) => {
  return (
    <div
      style={{
        border: "1px solid black",
        padding: "10px",
        textAlign: "center",
        cursor: "pointer",
        backgroundColor: question.isAnswered ? "gray" : "blue",
        color: "white",
      }}
      onClick={() => onQuestionClick(question)}
    >
      ${question.worth}
    </div>
  );
};

// CategoryColumn Component
interface CategoryColumnProps {
  category: string;
  questions: Question[];
  onQuestionClick: (question: Question) => void;
}

const CategoryColumn: React.FC<CategoryColumnProps> = ({
  category,
  questions,
  onQuestionClick,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          padding: "10px",
          border: "1px solid black",
        }}
      >
        {category}
      </div>
      {questions.map((question) => (
        <QuestionCell
          key={question.id}
          question={question}
          onQuestionClick={onQuestionClick}
        />
      ))}
    </div>
  );
};

// Board Component
export const Board: React.FC = () => {
  const groupedQuestions = groupQuestionsByCategory(questions);

  const { sendMessage } = useSend();
  const navigate = useNavigate();

  const handleQuestionClick = (question: Question) => {
    sendMessage("setViewingQuestion", { question });
    navigate("/app/question/" + question.id);
  };

  useSubscribe("setViewingQuestion", (q) => {
    navigate("/app/question/" + q.question.id);
  });

  return (
    <div style={{ display: "flex" }}>
      {Object.entries(groupedQuestions).map(([category, questions]) => (
        <CategoryColumn
          key={category}
          category={category}
          questions={questions}
          onQuestionClick={handleQuestionClick}
        />
      ))}
    </div>
  );
};
