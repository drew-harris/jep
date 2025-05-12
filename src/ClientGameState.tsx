import { useState } from "react";
import type { GameState } from "./state";
import { useSubscribe } from "./WebSocketContext";
import React from "react";

const GameStateContext = React.createContext<GameState | null>(null);

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
  const context = React.useContext(GameStateContext);
  if (!context) {
    throw new Error(
      "useGameState must be used within a ClientGameStateProvider",
    );
  }
  return context;
};
