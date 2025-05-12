import { useGameState } from "./ClientGameState";

export const QuestionView = () => {
  const { currentQuestion } = useGameState();
  if (!currentQuestion) {
    return;
  }

  return (
    <div>
      <div className="text-center">For {currentQuestion.worth} points</div>
      <div className="text-3xl text-center py-9">
        {currentQuestion.questionText}
      </div>
      {currentQuestion.isAnswered && (
        <>
          <hr />
          <div className="text-center text-3xl py-9">
            {currentQuestion.answerText}
          </div>
        </>
      )}
    </div>
  );
};
