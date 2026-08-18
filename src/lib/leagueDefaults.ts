import { LeagueSettings, RosterSlots } from "./types";

export const DEFAULT_ROSTER_SLOTS: RosterSlots = {
  QB: 1,
  RB: 2,
  WR: 2,
  TE: 1,
  FLEX: 1,
  DST: 1,
  K: 1,
  BENCH: 6,
};

export const DEFAULT_SETTINGS: LeagueSettings = {
  teamCount: 12,
  scoring: "ppr",
  rosterSlots: DEFAULT_ROSTER_SLOTS,
  myDraftSlot: 1,
};

export function totalRosterSize(slots: RosterSlots): number {
  return (
    slots.QB +
    slots.RB +
    slots.WR +
    slots.TE +
    slots.FLEX +
    slots.DST +
    slots.K +
    slots.BENCH
  );
}
