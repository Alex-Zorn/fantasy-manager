"use client";

import { useDraftDerived } from "@/hooks/useDraftDerived";
import { Position } from "@/lib/types";

const POSITIONS: Position[] = ["QB", "RB", "WR", "TE"];

export function BestAvailable() {
  const { availablePlayers } = useDraftDerived();

  return (
    <div className="space-y-3 p-3">
      <h3 className="text-sm font-semibold text-neutral-500">
        Best Available
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {POSITIONS.map((pos) => {
          const top = availablePlayers
            .filter((p) => p.position === pos)
            .slice(0, 5);
          return (
            <div key={pos}>
              <div className="text-xs font-semibold text-neutral-400">
                {pos}
              </div>
              <ul className="mt-1 space-y-0.5">
                {top.map((p) => (
                  <li key={p.id} className="truncate text-xs">
                    <span className="text-neutral-400">{p.rank}.</span>{" "}
                    {p.name}
                  </li>
                ))}
                {top.length === 0 && (
                  <li className="text-xs text-neutral-400">none left</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
