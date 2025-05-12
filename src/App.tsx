import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router";
export const App = () => {
  return (
    <div className="grid place-items-center min-h-[80vh]">
      <Link to="/app/board" className="font-italic text-[99px]">
        Drewpardy!
      </Link>
      <div style={{ background: "white", padding: "16px" }}>
        <QRCodeSVG size={200} value={window.location.toString() + "/buzzer"} />
      </div>
    </div>
  );
};
