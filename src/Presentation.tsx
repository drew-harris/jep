import { Board } from "./Board";
import { useGameState } from "./ClientGameState";
import { QuestionView } from "./QuestionView";

export const Presentation = () => {
  const gameState = useGameState();

  if (gameState.currentQuestion) {
    return <QuestionView />;
  }

  return <Board />;
};
