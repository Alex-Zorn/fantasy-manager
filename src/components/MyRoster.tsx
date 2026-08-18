"use client";

import { useDraft } from "@/context/DraftContext";
import { useDraftDerived } from "@/hooks/useDraftDerived";
import { assignRoster, byeConflicts, positionNeeds } from "@/lib/draftOrder";

export function MyRoster() {
  const { state } = useDraft();
  const { myPlayers } = useDraftDerived();
  const assignments = assignRoster(state.settings.rosterSlots, myPlayers);
  const needs = positionNeeds(state.settings.rosterSlots, myPlayers).filter(
    (n) => n.have < n.required,
  );
  const conflicts = byeConflicts(myPlayers);

  return (
    <div className="space-y-4 p-3">
      <div>
        <h3 className="text-sm font-semibold text-neutral-500">My Roster</h3>
        <ul className="mt-2 space-y-1">
          {assignments.map((a, i) => (
            <li
              key={i}
              className="flex items-center justify-between text-xs"
            >
              <span className="w-12 shrink-0 font-semibold text-neutral-400">
                {a.slot}
              </span>
              <span
                className={`flex-1 truncate ${a.player ? "" : "text-neutral-400"}`}
              >
                {a.player
                  ? `${a.player.name} (${a.player.position}-${a.player.team})`
                  : "empty"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {needs.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-neutral-500">
            Still needed
          </h4>
          <p className="mt-1 text-xs">
            {needs
              .map((n) => `${n.position} (${n.have}/${n.required})`)
              .join(", ")}
          </p>
        </div>
      )}

      {conflicts.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            Bye week conflicts
          </h4>
          <ul className="mt-1 space-y-1 text-xs">
            {conflicts.map((c) => (
              <li key={c.bye}>
                Week {c.bye}: {c.players.map((p) => p.name).join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
