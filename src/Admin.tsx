import { Board } from "./Board";
import { useGameState } from "./ClientGameState";
import { QuestionView } from "./QuestionView";
import { game } from "./state";
import { useSend } from "./WebSocketContext";

const Scores = () => {
  const state = useGameState();
  return (
    <div className="flex flex-col py-2 gap-2 justify-evenly">
      {Object.entries(state.scores).map((e) => {
        return (
          <div>
            {e[0]}: {e[1]}
          </div>
        );
      })}
    </div>
  );
};

export const Admin = () => {
  const { sendMessage } = useSend();
  const state = useGameState();

  return (
    <div>
      <div className="flex gap-2 flex-col">
        <div className="flex justify-between">
          <button
            onClick={() => {
              const result = confirm("Are you sure?");
              if (result) {
                sendMessage("reset", {});
              }
            }}
            className=""
          >
            RESET
          </button>
          <button
            onClick={() => {
              sendMessage("setShowCode", { showCode: !state.showingCode });
            }}
          >
            Set Show Code
          </button>
        </div>
        <button
          onClick={() => {
            sendMessage("unsetQuestion", {});
          }}
          className="text-lg border-yellow-100 border w-full py-2 bg-yellow-400 text-black"
        >
          Unset Question
        </button>
        <button
          onClick={() => {
            sendMessage("revealAnswer", {});
          }}
          className="text-lg border-yellow-100 border w-full py-2 bg-yellow-400 text-black"
        >
          Reveal Answer
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => {
              sendMessage("startTimer", { seconds: 20 });
            }}
            className="text-lg border-yellow-100 border w-full py-2 bg-yellow-400 text-black"
          >
            Start Timer
          </button>
          <button
            onClick={() => {
              sendMessage("stopTimer", {});
            }}
            className="text-lg border-yellow-100 border w-full py-2 bg-yellow-400 text-black"
          >
            Stop Timer
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              sendMessage("allowBuzz", { allowed: true });
            }}
            className="text-lg border-yellow-100 border w-full py-2 bg-yellow-400 text-black"
          >
            Allow Buzz
          </button>
          <button
            onClick={() => {
              sendMessage("clearBuzz", {});
            }}
            className="text-lg border-yellow-100 border w-full py-2 bg-yellow-500 text-black"
          >
            Clear Buzz
          </button>
        </div>
      </div>
      <div className="py-2"></div>
      <AwardPoints />
      <div className="h-2"></div>
      <QuestionView />
      <Board />
      <Scores />
    </div>
  );
};

const AwardPoints = () => {
  const gameState = useGameState();
  const { sendMessage } = useSend();

  const increment = gameState.currentQuestion
    ? gameState.currentQuestion.worth
    : 100;

  return (
    <div>
      <div>Award Points</div>
      {Object.keys(gameState.scores).map((team) => {
        return (
          <div className="flex items-center justify-stretch gap-2">
            <button
              onClick={() => {
                sendMessage("awardPoints", {
                  teamName: team,
                  amount: increment,
                });
              }}
              style={{
                backgroundColor: !gameState.currentQuestion
                  ? "#ccc"
                  : undefined,
              }}
              className="text-lg border-yellow-100 border w-full py-2 bg-yellow-400 text-black"
            >
              Add {increment}
            </button>
            <div className="bg-blue-700 text-lg font-bold text-white text-center px-7">
              {team}: {gameState.scores[team]}
            </div>
            <button
              style={{
                backgroundColor: !gameState.currentQuestion
                  ? "#ccc"
                  : undefined,
              }}
              onClick={() => {
                sendMessage("deductPoints", {
                  teamName: team,
                  amount: increment,
                });
              }}
              className="text-lg border-yellow-100 border w-full py-2 bg-yellow-400 text-black"
            >
              Subtract {increment}
            </button>
          </div>
        );
      })}
    </div>
  );
};
