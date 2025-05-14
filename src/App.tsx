import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router";
import { useGameState } from "./ClientGameState";

export const App = () => {
  const state = useGameState();
  return (
    <div className="grid place-items-center min-h-[80vh]">
      <Link to="/app/presentation" className="font-italic text-[99px]">
        Drewpardy!
      </Link>
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
