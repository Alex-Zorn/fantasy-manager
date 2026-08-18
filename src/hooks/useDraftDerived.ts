import { useMemo } from "react";
import { useDraft } from "@/context/DraftContext";
import { currentOverallPick, nextMyPick, pickMetaForOverall } from "@/lib/draftOrder";
import { Player } from "@/lib/types";

export function useDraftDerived() {
  const { state } = useDraft();
  const { players, picks, settings } = state;

  const draftedIds = useMemo(
    () => new Set(picks.map((p) => p.playerId)),
    [picks],
  );

  const availablePlayers = useMemo(
    () => players.filter((p) => !draftedIds.has(p.id)),
    [players, draftedIds],
  );

  const playersById = useMemo(() => {
    const map = new Map<string, Player>();
    for (const p of players) map.set(p.id, p);
    return map;
  }, [players]);

  const myPlayers = useMemo(
    () =>
      picks
        .filter((p) => p.isMyTeam)
        .map((p) => playersById.get(p.playerId))
        .filter((p): p is Player => Boolean(p)),
    [picks, playersById],
  );

  const overallPick = currentOverallPick(picks);
  const currentMeta = pickMetaForOverall(overallPick, settings);
  const myNextPickOverall = currentMeta.isMyTeam
    ? overallPick
    : nextMyPick(overallPick + 1, settings);

  return {
    availablePlayers,
    playersById,
    draftedIds,
    myPlayers,
    overallPick,
    currentMeta,
    myNextPickOverall,
  };
}
