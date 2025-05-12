import { useGameState } from "./ClientGameState";
import { useSubscribe, useSend } from "./WebSocketContext";

export const Buzzer = () => {
  useSubscribe("buzzAccept", (d) => {
    console.log("buzzAccept", d);
  });

  const { sendMessage } = useSend();
  const gameState = useGameState();

  return (
    <div>
      <div>WElcome</div>
      <div>Count: {gameState.count}</div>
      <button onClick={() => sendMessage("incrementCount", {})}>
        Send Message
      </button>
    </div>
  );
};
