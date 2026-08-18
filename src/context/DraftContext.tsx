"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { SEED_PLAYERS } from "@/data/players";
import { pickMetaForOverall } from "@/lib/draftOrder";
import { DEFAULT_SETTINGS } from "@/lib/leagueDefaults";
import { DraftState, LeagueSettings, Player } from "@/lib/types";

const STORAGE_KEY = "fantasy-draft-state-v1";

type Action =
  | { type: "UPDATE_SETTINGS"; settings: Partial<LeagueSettings> }
  | { type: "SET_PLAYERS"; players: Player[] }
  | { type: "START_DRAFT" }
  | { type: "DRAFT_PLAYER"; playerId: string }
  | { type: "UNDO_LAST_PICK" }
  | { type: "RESET_DRAFT" }
  | { type: "HYDRATE"; state: DraftState };

function initialState(): DraftState {
  return {
    settings: DEFAULT_SETTINGS,
    players: SEED_PLAYERS,
    picks: [],
    started: false,
  };
}

function reducer(state: DraftState, action: Action): DraftState {
  switch (action.type) {
    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };
    case "SET_PLAYERS":
      return { ...state, players: action.players };
    case "START_DRAFT":
      return { ...state, started: true };
    case "DRAFT_PLAYER": {
      const overallPick = state.picks.length + 1;
      const meta = pickMetaForOverall(overallPick, state.settings);
      return {
        ...state,
        picks: [
          ...state.picks,
          {
            overallPick,
            round: meta.round,
            pickInRound: meta.pickInRound,
            teamIndex: meta.teamIndex,
            isMyTeam: meta.isMyTeam,
            playerId: action.playerId,
          },
        ],
      };
    }
    case "UNDO_LAST_PICK":
      return { ...state, picks: state.picks.slice(0, -1) };
    case "RESET_DRAFT":
      return { ...state, picks: [], started: false };
    case "HYDRATE":
      return action.state;
    default:
      return state;
  }
}

interface DraftContextValue {
  state: DraftState;
  dispatch: React.Dispatch<Action>;
  hydrated: boolean;
}

const DraftContext = createContext<DraftContextValue | null>(null);

export function DraftProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        dispatch({ type: "HYDRATE", state: JSON.parse(raw) as DraftState });
      }
    } catch {
      // ignore corrupt storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value = useMemo(
    () => ({ state, dispatch, hydrated }),
    [state, hydrated],
  );

  return (
    <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
  );
}

export function useDraft() {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error("useDraft must be used within a DraftProvider");
  return ctx;
}
