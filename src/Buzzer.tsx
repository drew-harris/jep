import { useGameState } from "./ClientGameState";
import { useSend } from "./WebSocketContext";

export const Buzzer = () => {
  const { sendMessage } = useSend();
  const gameState = useGameState();

  return (
    <div>
      <div className="w-full text-3xl text-center">BUZZER</div>
      <div>Count: {gameState.count}</div>
      <button onClick={() => sendMessage("incrementCount", {})}>
        Send Message
      </button>
    </div>
  );
};
