export type Position = "QB" | "RB" | "WR" | "TE" | "DST" | "K";

export interface Player {
  id: string;
  rank: number;
  name: string;
  team: string;
  position: Position;
  bye: number | null;
  tier: number;
}

export interface RosterSlots {
  QB: number;
  RB: number;
  WR: number;
  TE: number;
  FLEX: number;
  DST: number;
  K: number;
  BENCH: number;
}

export type ScoringFormat = "ppr" | "half" | "standard";

export interface LeagueSettings {
  teamCount: number;
  scoring: ScoringFormat;
  rosterSlots: RosterSlots;
  myDraftSlot: number; // 1-indexed
}

export interface Pick {
  overallPick: number;
  round: number;
  pickInRound: number; // 1-indexed
  teamIndex: number; // 0-indexed
  isMyTeam: boolean;
  playerId: string;
}

export interface DraftState {
  settings: LeagueSettings;
  players: Player[];
  picks: Pick[];
  started: boolean;
}
