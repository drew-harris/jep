import { useSubscribe, useSend } from "./WebSocketContext";

export const Buzzer = () => {
  useSubscribe("buzzAccept", (d) => {
    console.log("buzzAccept", d);
  });

  const { sendMessage } = useSend();

  return (
    <div>
      <div>This is the buzzer</div>
      <button onClick={() => sendMessage("buzzAccept", { teamName: "test" })}>
        Send Message
      </button>
    </div>
  );
};
