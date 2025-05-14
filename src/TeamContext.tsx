import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useGameState } from "./ClientGameState";
import { useSend } from "./WebSocketContext";

const TeamContext = createContext<string | null>(null);

export const TeamContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [team, setTeam] = useState<string | null>(null);
  const gameState = useGameState();
  const [inputTeam, setInputTeam] = useState<string>("");

  const allGood = useMemo(() => {
    if (!team) return false;
    if (gameState.scores[team] !== undefined && team) {
      return true;
    }
    return false;
  }, [gameState, team]);
  const { sendMessage } = useSend();

  const submit = (name: string) => {
    if (name === "") {
      alert("team name required");
      return;
    }
    setTeam(name);
    sendMessage("signUp", { teamName: name });
    window.localStorage.setItem("teamname", name);
  };

  useEffect(() => {
    const potentialSave = window.localStorage.getItem("teamname");
    if (potentialSave) {
      setInputTeam(potentialSave);
      submit(potentialSave);
    }
  }, []);

  if (!allGood) {
    return (
      <div className="flex gap-2 flex-col">
        <input
          value={inputTeam}
          onChange={(e) => setInputTeam(e.target.value)}
          className="text-lg border-yellow-100 border w-full py-2 px-2"
          placeholder="Team Name"
        />
        <button
          type="button"
          onClick={() => {
            submit(inputTeam);
          }}
          className="text-lg border-yellow-100 border w-full py-2"
        >
          JOIN
        </button>
      </div>
    );
  }
  return <TeamContext.Provider value={team}>{children}</TeamContext.Provider>;
};

export const useTeamName = () => {
  const ctx = useContext(TeamContext);
  if (!ctx) {
    throw new Error("Bad context");
  }

  return ctx;
};
