"use client";

import { useDraft } from "@/context/DraftContext";
import { totalDraftPicks } from "@/lib/draftOrder";
import { useDraftDerived } from "@/hooks/useDraftDerived";

export function DraftHeader() {
  const { state, dispatch } = useDraft();
  const { overallPick, currentMeta, myNextPickOverall } = useDraftDerived();
  const total = totalDraftPicks(state.settings);
  const done = overallPick > total;

  const picksAway =
    !done && myNextPickOverall != null && !currentMeta.isMyTeam
      ? myNextPickOverall - overallPick
      : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
      <div>
        <div className="text-xs uppercase tracking-wide text-neutral-500">
          Pick {Math.min(overallPick, total)} of {total} &middot; Round{" "}
          {Math.min(currentMeta.round, Math.ceil(total / state.settings.teamCount))}
        </div>
        {done ? (
          <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
            Draft complete
          </div>
        ) : currentMeta.isMyTeam ? (
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            YOUR PICK
          </div>
        ) : (
          <div className="text-lg font-semibold">
            Team {currentMeta.teamIndex + 1} on the clock
            {picksAway != null && (
              <span className="ml-2 text-sm font-normal text-neutral-500">
                (your pick in {picksAway})
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "UNDO_LAST_PICK" })}
          disabled={state.picks.length === 0}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 disabled:opacity-40 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Undo last pick
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm("Reset the draft? This clears all picks.")) {
              dispatch({ type: "RESET_DRAFT" });
            }
          }}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          Reset draft
        </button>
      </div>
    </div>
  );
}
