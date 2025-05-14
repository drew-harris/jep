import { createContext, useContext, useState } from "react";
import type { GameState } from "./state";
import { useSubscribe } from "./WebSocketContext";

const GameStateContext = createContext<GameState | null>(null);

export const ClientGameStateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [gameState, setGameState] = useState<GameState | null>(null);

  useSubscribe("sync", (d) => {
    console.log("got sync message", d);
    setGameState(d);
  });

  if (!gameState) {
    return null;
  }

  return (
    <GameStateContext.Provider value={gameState}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error(
      "useGameState must be used within a ClientGameStateProvider",
    );
  }
  return context;
};
