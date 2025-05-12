import { useGameState } from "./ClientGameState";
import { useTeamName } from "./TeamContext";
import { useSend } from "./WebSocketContext";

const BuzzerCurrentQuestion = () => {
  const state = useGameState();
  if (!state.currentQuestion) {
    return;
  }

  return (
    <div className="text-center pt-2">{state.currentQuestion.questionText}</div>
  );
};

export const Buzzer = () => {
  const { sendMessage } = useSend();
  const gameState = useGameState();
  const teamName = useTeamName();

  return (
    <div>
      <div className="text-center">Team: {teamName}</div>
      <div className="text-center">Score: {gameState.scores[teamName]}</div>
      <BuzzerCurrentQuestion />
    </div>
  );
};
