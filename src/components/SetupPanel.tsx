"use client";

import { useRef, useState } from "react";
import { useDraft } from "@/context/DraftContext";
import { parsePlayerCsv } from "@/lib/csv";
import { SEED_PLAYERS } from "@/data/players";
import { RosterSlots, ScoringFormat } from "@/lib/types";

const SLOT_FIELDS: { key: keyof RosterSlots; label: string }[] = [
  { key: "QB", label: "QB" },
  { key: "RB", label: "RB" },
  { key: "WR", label: "WR" },
  { key: "TE", label: "TE" },
  { key: "FLEX", label: "FLEX" },
  { key: "DST", label: "DST" },
  { key: "K", label: "K" },
  { key: "BENCH", label: "Bench" },
];

export function SetupPanel() {
  const { state, dispatch } = useDraft();
  const { settings } = state;
  const [importText, setImportText] = useState("");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateSlots = (key: keyof RosterSlots, value: number) => {
    dispatch({
      type: "UPDATE_SETTINGS",
      settings: {
        rosterSlots: { ...settings.rosterSlots, [key]: Math.max(0, value) },
      },
    });
  };

  const applyImport = (text: string) => {
    const { players, skippedRows } = parsePlayerCsv(text);
    if (players.length === 0) {
      setImportMessage(
        "Couldn't find any valid rows. Expect columns like Rank, Player, Team, Position, Bye.",
      );
      return;
    }
    dispatch({ type: "SET_PLAYERS", players });
    setImportMessage(
      `Imported ${players.length} players${skippedRows ? ` (skipped ${skippedRows} unrecognized rows)` : ""}.`,
    );
  };

  const useStarterSheet = () => {
    dispatch({ type: "SET_PLAYERS", players: SEED_PLAYERS });
    setImportMessage(`Using the built-in starter cheat sheet (${SEED_PLAYERS.length} players).`);
  };

  const playerCount = state.players.length;

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Draft Setup</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Set your league format, then start the draft. You can mark picks as
          they happen (yours or anyone else&apos;s) and the tracker keeps the
          on-the-clock order for you.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">League</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            Teams
            <input
              type="number"
              min={2}
              max={20}
              value={settings.teamCount}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_SETTINGS",
                  settings: { teamCount: Number(e.target.value) || 2 },
                })
              }
              className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Scoring
            <select
              value={settings.scoring}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_SETTINGS",
                  settings: { scoring: e.target.value as ScoringFormat },
                })
              }
              className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="ppr">Full PPR</option>
              <option value="half">Half PPR</option>
              <option value="standard">Standard</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            My draft slot
            <select
              value={settings.myDraftSlot}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_SETTINGS",
                  settings: { myDraftSlot: Number(e.target.value) },
                })
              }
              className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
            >
              {Array.from({ length: settings.teamCount }, (_, i) => i + 1).map(
                (n) => (
                  <option key={n} value={n}>
                    Pick {n}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Roster slots</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {SLOT_FIELDS.map(({ key, label }) => (
            <label key={key} className="flex flex-col gap-1 text-xs">
              {label}
              <input
                type="number"
                min={0}
                max={10}
                value={settings.rosterSlots[key]}
                onChange={(e) => updateSlots(key, Number(e.target.value))}
                className="rounded border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Player rankings</h2>
        <p className="text-sm text-neutral-500">
          Currently loaded: <strong>{playerCount}</strong> players.{" "}
          {state.players === SEED_PLAYERS ? (
            <span>
              Built-in cheat sheet, ranked by Value-Based Drafting (projected
              points above each position&apos;s replacement level) from
              FantasyPros projections. Re-run{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800">
                npm run gen:players
              </code>{" "}
              after downloading updated projections, or import your own CSV
              below.
            </span>
          ) : null}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={useStarterSheet}
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Use starter cheat sheet
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Upload CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              applyImport(await file.text());
              e.target.value = "";
            }}
          />
        </div>
        <details className="text-sm">
          <summary className="cursor-pointer text-neutral-500">
            Or paste CSV text
          </summary>
          <div className="mt-2 space-y-2">
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={"Rank,Player,Team,Position,Bye\n1,Ja'Marr Chase,CIN,WR,11"}
              rows={6}
              className="w-full rounded border border-neutral-300 p-2 font-mono text-xs dark:border-neutral-700 dark:bg-neutral-900"
            />
            <button
              type="button"
              onClick={() => applyImport(importText)}
              disabled={!importText.trim()}
              className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
            >
              Import pasted CSV
            </button>
          </div>
        </details>
        {importMessage && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            {importMessage}
          </p>
        )}
      </section>

      <button
        type="button"
        onClick={() => dispatch({ type: "START_DRAFT" })}
        className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-base font-semibold text-white hover:bg-emerald-500"
      >
        Start Draft
      </button>
    </div>
  );
}
