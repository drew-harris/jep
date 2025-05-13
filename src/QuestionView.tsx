import { useState } from "react";
import { useGameState } from "./ClientGameState";
import { useSubscribe } from "./WebSocketContext";

export const QuestionView = () => {
  const { currentQuestion } = useGameState();
  if (!currentQuestion) {
    return null;
  }

  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [timers, setTimers] = useState<number[]>([]);

  const [buzzText, setBuzzText] = useState("");

  useSubscribe("startTimer", (data) => {
    setSecondsRemaining(data.seconds);

    const timerId = setInterval(() => {
      setSecondsRemaining((prevSeconds) => {
        console.log("tick", prevSeconds);
        if (prevSeconds && prevSeconds > 1) {
          return prevSeconds - 1;
        } else {
          clearInterval(timerId);
          setTimers((prevTimers) => prevTimers.filter((id) => id !== timerId));
          return null; // Or 0, depending on desired behavior
        }
      });
    }, 1000) as any as number;

    setTimers((prev) => [...prev, timerId]);
  });

  useSubscribe("stopTimer", () => {
    timers.forEach((timerId) => clearInterval(timerId));
    setTimers([]);
    setSecondsRemaining(null);
  });

  useSubscribe("buzzAccepted", (data) => {
    setBuzzText(`${data.teamName} Buzzed First!`);
  });

  useSubscribe("clearBuzz", () => {
    setBuzzText("");
  });

  return (
    <div>
      <div className="text-center">For {currentQuestion.worth} points</div>
      <div className="text-3xl text-center py-9">
        {currentQuestion.questionText}
      </div>
      {buzzText && <div className="text-center text-2xl">{buzzText}</div>}
      {currentQuestion.isAnswered && (
        <>
          <hr />
          <div className="text-center text-3xl py-9">
            {currentQuestion.answerText}
          </div>
        </>
      )}
      {secondsRemaining !== null && (
        <div className="text-center text-4xl">{secondsRemaining}</div>
      )}
    </div>
  );
};
