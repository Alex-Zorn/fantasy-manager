import { totalRosterSize } from "./leagueDefaults";
import { LeagueSettings, Pick, Player, Position, RosterSlots } from "./types";

export interface PickMeta {
  overallPick: number;
  round: number;
  pickInRound: number; // 1-indexed within the round
  teamIndex: number; // 0-indexed
  isMyTeam: boolean;
}

/** Snake draft: odd rounds go 1..N, even rounds go N..1. */
export function pickMetaForOverall(
  overallPick: number,
  settings: LeagueSettings,
): PickMeta {
  const { teamCount, myDraftSlot } = settings;
  const round = Math.ceil(overallPick / teamCount);
  const pickInRound = overallPick - (round - 1) * teamCount;
  const teamIndex =
    round % 2 === 1 ? pickInRound - 1 : teamCount - pickInRound;
  return {
    overallPick,
    round,
    pickInRound,
    teamIndex,
    isMyTeam: teamIndex === myDraftSlot - 1,
  };
}

export function totalDraftPicks(settings: LeagueSettings): number {
  return settings.teamCount * totalRosterSize(settings.rosterSlots);
}

export function currentOverallPick(picks: Pick[]): number {
  return picks.length + 1;
}

/** Next overall pick number (from `fromOverallPick` inclusive) that belongs to my team. */
export function nextMyPick(
  fromOverallPick: number,
  settings: LeagueSettings,
): number | null {
  const total = totalDraftPicks(settings);
  for (let p = fromOverallPick; p <= total; p++) {
    if (pickMetaForOverall(p, settings).isMyTeam) return p;
  }
  return null;
}

const FLEX_ELIGIBLE: Position[] = ["RB", "WR", "TE"];

export interface RosterAssignment {
  slot: string;
  player: Player | null;
}

/** Greedily fills required slots (QB, RB, WR, TE, FLEX, DST, K) then BENCH from a list of drafted players. */
export function assignRoster(
  slots: RosterSlots,
  myPlayers: Player[],
): RosterAssignment[] {
  const remaining = [...myPlayers].sort((a, b) => a.rank - b.rank);
  const take = (pred: (p: Player) => boolean): Player | null => {
    const idx = remaining.findIndex(pred);
    if (idx === -1) return null;
    return remaining.splice(idx, 1)[0];
  };

  const assignments: RosterAssignment[] = [];

  const fixedSlots: { key: keyof RosterSlots; pos: Position }[] = [
    { key: "QB", pos: "QB" },
    { key: "RB", pos: "RB" },
    { key: "WR", pos: "WR" },
    { key: "TE", pos: "TE" },
    { key: "DST", pos: "DST" },
    { key: "K", pos: "K" },
  ];

  for (const { key, pos } of fixedSlots) {
    for (let i = 0; i < slots[key]; i++) {
      assignments.push({
        slot: key,
        player: take((p) => p.position === pos),
      });
    }
  }

  for (let i = 0; i < slots.FLEX; i++) {
    assignments.push({
      slot: "FLEX",
      player: take((p) => FLEX_ELIGIBLE.includes(p.position)),
    });
  }

  for (let i = 0; i < slots.BENCH; i++) {
    assignments.push({ slot: "BENCH", player: remaining.shift() ?? null });
  }

  // Anything left over (drafted beyond roster size) still counts as bench overflow.
  while (remaining.length > 0) {
    assignments.push({ slot: "BENCH", player: remaining.shift()! });
  }

  return assignments;
}

export interface PositionNeed {
  position: Position;
  have: number;
  required: number;
}

/** Required = starting slots only (FLEX split evenly across RB/WR/TE as partial credit). */
export function positionNeeds(
  slots: RosterSlots,
  myPlayers: Player[],
): PositionNeed[] {
  const counts: Record<Position, number> = {
    QB: 0,
    RB: 0,
    WR: 0,
    TE: 0,
    DST: 0,
    K: 0,
  };
  for (const p of myPlayers) counts[p.position]++;

  const required: Record<Position, number> = {
    QB: slots.QB,
    RB: slots.RB,
    WR: slots.WR,
    TE: slots.TE,
    DST: slots.DST,
    K: slots.K,
  };

  return (Object.keys(counts) as Position[]).map((position) => ({
    position,
    have: counts[position],
    required: required[position],
  }));
}

export interface ByeConflict {
  bye: number;
  players: Player[];
}

/** Flags bye weeks where 2+ of my drafted players at the same position share a bye. */
export function byeConflicts(myPlayers: Player[]): ByeConflict[] {
  const byPosAndBye = new Map<string, Player[]>();
  for (const p of myPlayers) {
    if (p.bye == null) continue;
    const key = `${p.position}-${p.bye}`;
    const list = byPosAndBye.get(key) ?? [];
    list.push(p);
    byPosAndBye.set(key, list);
  }
  const conflicts: ByeConflict[] = [];
  for (const list of byPosAndBye.values()) {
    if (list.length >= 2) {
      conflicts.push({ bye: list[0].bye as number, players: list });
    }
  }
  return conflicts.sort((a, b) => a.bye - b.bye);
}
