import { QRCodeSVG } from "qrcode.react";
export const App = () => {
  return (
    <div className="grid place-items-center min-h-[80vh]">
      <div className="font-italic text-[99px]">Drewpardy!</div>
      <div style={{ background: "white", padding: "16px" }}>
        <QRCodeSVG size={200} value={window.location.toString() + "/buzzer"} />
      </div>
    </div>
  );
};
