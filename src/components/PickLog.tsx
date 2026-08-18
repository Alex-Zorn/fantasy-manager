"use client";

import { useDraft } from "@/context/DraftContext";
import { useDraftDerived } from "@/hooks/useDraftDerived";

export function PickLog() {
  const { state } = useDraft();
  const { playersById } = useDraftDerived();
  const picks = [...state.picks].reverse();

  return (
    <div className="p-3">
      <h3 className="text-sm font-semibold text-neutral-500">Pick Log</h3>
      <ul className="mt-2 max-h-64 space-y-1 overflow-auto text-xs">
        {picks.map((pick) => {
          const player = playersById.get(pick.playerId);
          return (
            <li
              key={pick.overallPick}
              className={`flex justify-between rounded px-1.5 py-1 ${
                pick.isMyTeam
                  ? "bg-emerald-50 dark:bg-emerald-900/20"
                  : ""
              }`}
            >
              <span className="text-neutral-400">
                {pick.round}.{String(pick.pickInRound).padStart(2, "0")}
              </span>
              <span className="flex-1 truncate px-2">
                {player ? player.name : "Unknown"}{" "}
                {player && (
                  <span className="text-neutral-400">
                    ({player.position}-{player.team})
                  </span>
                )}
              </span>
              <span
                className={
                  pick.isMyTeam
                    ? "font-semibold text-emerald-600 dark:text-emerald-400"
                    : "text-neutral-400"
                }
              >
                {pick.isMyTeam ? "YOU" : `T${pick.teamIndex + 1}`}
              </span>
            </li>
          );
        })}
        {picks.length === 0 && (
          <li className="text-neutral-400">No picks yet.</li>
        )}
      </ul>
    </div>
  );
}
