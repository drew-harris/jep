import { questions } from "./questions";
import { useParams } from "react-router";

export const QuestionView = () => {
  const { id } = useParams();
  const question = questions.find((q) => q.id === id);
  return (
    <div>
      <div>{JSON.stringify(question)}</div>
    </div>
  );
};
