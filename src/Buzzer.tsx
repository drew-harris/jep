import { useGameState } from "./ClientGameState";
import { useTeamName } from "./TeamContext";
import { useSend, useSubscribe } from "./WebSocketContext";

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

  useSubscribe("buzzAccepted", (data) => {
    console.log("got buzzAccepted message", data);
  });

  return (
    <div>
      <div className="text-center">Team: {teamName}</div>
      <div className="text-center">Score: {gameState.scores[teamName]}</div>
      <BuzzerCurrentQuestion />
      {gameState.allowBuzz && (
        <div
          onClick={() => {
            sendMessage("buzzIn", { teamName });
          }}
          className="rounded-[100%] mx-auto mt-4 grid place-items-center h-[50vw] text-center bg-red-500 w-[50vw]"
        >
          <div className="text-3xl">Buzz</div>
        </div>
      )}
    </div>
  );
};
