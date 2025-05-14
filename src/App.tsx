import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router";
import { useGameState } from "./ClientGameState";

export const App = () => {
  const state = useGameState();
  return (
    <div className="grid place-items-center min-h-[80vh]">
      <div>
        <Link to="/app/presentation" className="font-italic text-[99px]">
          Drewpardy!
        </Link>
        <div className="text-center">(Mini)</div>
      </div>
      {state.showingCode && (
        <div style={{ background: "white", padding: "16px" }}>
          <QRCodeSVG
            size={200}
            value={window.location.toString() + "/buzzer"}
          />
        </div>
      )}
    </div>
  );
};
