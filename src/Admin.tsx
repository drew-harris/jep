import { Board } from "./Board";
import { useGameState } from "./ClientGameState";
import { useSend } from "./WebSocketContext";

const Scores = () => {
  const state = useGameState();
  return (
    <div className="flex gap-2 justify-evenly">
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

  return (
    <div>
      <div className="flex gap-2 flex-col">
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
        <button
          onClick={() => {
            sendMessage("allowBuzz", { allowed: true });
          }}
          className="text-lg border-yellow-100 border w-full py-2 bg-yellow-400 text-black"
        >
          Allow Buzz
        </button>
      </div>
      <div className="py-2"></div>
      <Board />
      <Scores />
    </div>
  );
};
