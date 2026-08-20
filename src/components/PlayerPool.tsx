"use client";

import { useMemo, useState } from "react";
import { useDraft } from "@/context/DraftContext";
import { useDraftDerived } from "@/hooks/useDraftDerived";
import { Position } from "@/lib/types";

const POSITION_TABS: ("ALL" | Position)[] = [
  "ALL",
  "QB",
  "RB",
  "WR",
  "TE",
  "DST",
  "K",
];

const POSITION_COLOR: Record<Position, string> = {
  QB: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  RB: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  WR: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  TE: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  DST: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  K: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

export function PlayerPool() {
  const { dispatch } = useDraft();
  const { availablePlayers, currentMeta } = useDraftDerived();
  const [tab, setTab] = useState<"ALL" | Position>("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return availablePlayers.filter((p) => {
      if (tab !== "ALL" && p.position !== tab) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [availablePlayers, tab, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 p-3 dark:border-neutral-800">
        <input
          type="text"
          placeholder="Search players..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-48 rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <div className="flex gap-1">
          {POSITION_TABS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setTab(p)}
              className={`rounded px-2 py-1 text-xs font-medium ${
                tab === p
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-neutral-500">
          {filtered.length} available
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-neutral-50 text-xs uppercase text-neutral-500 dark:bg-neutral-900">
            <tr>
              <th className="px-3 py-2 font-medium">Rank</th>
              <th className="px-3 py-2 font-medium">Player</th>
              <th className="px-3 py-2 font-medium">Pos</th>
              <th className="px-3 py-2 font-medium">Team</th>
              <th className="px-3 py-2 font-medium">Bye</th>
              <th className="px-3 py-2 text-right font-medium">VBD</th>
              <th className="px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900"
              >
                <td className="px-3 py-1.5 text-neutral-500">{p.rank}</td>
                <td className="px-3 py-1.5 font-medium">{p.name}</td>
                <td className="px-3 py-1.5">
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs font-semibold ${POSITION_COLOR[p.position]}`}
                  >
                    {p.position}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-neutral-500">{p.team}</td>
                <td className="px-3 py-1.5 text-neutral-500">
                  {p.bye ?? "-"}
                </td>
                <td className="px-3 py-1.5 text-right font-medium text-emerald-700 dark:text-emerald-400">
                  {typeof p.vbd === "number" ? p.vbd.toFixed(1) : ""}
                </td>
                <td className="px-3 py-1.5 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({ type: "DRAFT_PLAYER", playerId: p.id })
                    }
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      currentMeta.isMyTeam
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    }`}
                  >
                    {currentMeta.isMyTeam ? "Draft to my team" : "Mark drafted"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-neutral-500">
                  No players match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
