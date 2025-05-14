import { useState } from "react";
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

  const [buzzerBlocked, setBuzzerBlocked] = useState(false);

  const triggerEarlyBuzz = () => {
    setBuzzerBlocked(true);
    setTimeout(() => {
      setBuzzerBlocked(false);
    }, 2000);
  };

  useSubscribe("buzzAccepted", (data) => {
    console.log("got buzzAccepted message", data);
    // Set background to green and back quickly if buzz accepted
    // and red if another team got it
    const currentColor = document.body.style.backgroundColor;
    if (data.teamName === teamName) {
      document.body.style.backgroundColor = "#00cd00";
    } else {
      document.body.style.backgroundColor = "#cc0000";
    }
    setTimeout(() => {
      document.body.style.backgroundColor = currentColor;
    }, 500);
  });

  return (
    <div>
      <div className="text-center">Team: {teamName}</div>
      <div className="text-center">Score: {gameState.scores[teamName]}</div>
      <BuzzerCurrentQuestion />
      {gameState.allowBuzz && (
        <div
          onClick={() => {
            if (!buzzerBlocked) {
              sendMessage("buzzIn", { teamName });
            }
          }}
          className="rounded-[100%] mx-auto mt-4 grid place-items-center h-[50vw] text-center bg-red-500 w-[50vw]"
        >
          <div className="text-3xl">Buzz</div>
        </div>
      )}
      {!gameState.allowBuzz && (
        <div
          onClick={() => {
            triggerEarlyBuzz();
          }}
          className="rounded-[100%] mx-auto mt-4 grid place-items-center h-[50vw] text-center w-[50vw]"
        >
          <div className="text-3xl">{buzzerBlocked && "Not Yet"}</div>
        </div>
      )}
    </div>
  );
};
