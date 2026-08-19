#!/usr/bin/env node
// Regenerates src/data/players.ts from the FantasyPros projection CSVs in
// src/data/fantasypros_projections/, ranked by static Value-Based Drafting
// (VBD): each player's projected points minus their position's
// replacement-level baseline (the "last starter" method — FLEX slots are
// allocated across RB/WR/TE proportional to their starter counts, no extra
// bench buffer). Re-run this whenever you download fresh projections:
//
//   npm run gen:players
//
// Keep TEAM_COUNT / ROSTER_SLOTS in sync with src/lib/leagueDefaults.ts.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTIONS_DIR = path.join(
  __dirname,
  "../src/data/fantasypros_projections",
);
const OUT_FILE = path.join(__dirname, "../src/data/players.ts");

const TEAM_COUNT = 12;
const ROSTER_SLOTS = { QB: 1, RB: 2, WR: 2, TE: 1, FLEX: 1, DST: 1, K: 1, BENCH: 6 };
const FLEX_ELIGIBLE = ["RB", "WR", "TE"];

const POSITION_FILES = {
  QB: "FantasyPros_Fantasy_Football_Projections_QB.csv",
  RB: "FantasyPros_Fantasy_Football_Projections_RB.csv",
  WR: "FantasyPros_Fantasy_Football_Projections_WR.csv",
  TE: "FantasyPros_Fantasy_Football_Projections_TE.csv",
  K: "FantasyPros_Fantasy_Football_Projections_K.csv",
  DST: "FantasyPros_Fantasy_Football_Projections_DST.csv",
};

const TEAM_NAME_TO_ABBR = {
  "Arizona Cardinals": "ARI", "Atlanta Falcons": "ATL", "Baltimore Ravens": "BAL",
  "Buffalo Bills": "BUF", "Carolina Panthers": "CAR", "Chicago Bears": "CHI",
  "Cincinnati Bengals": "CIN", "Cleveland Browns": "CLE", "Dallas Cowboys": "DAL",
  "Denver Broncos": "DEN", "Detroit Lions": "DET", "Green Bay Packers": "GB",
  "Houston Texans": "HOU", "Indianapolis Colts": "IND", "Jacksonville Jaguars": "JAC",
  "Kansas City Chiefs": "KC", "Las Vegas Raiders": "LV", "Los Angeles Chargers": "LAC",
  "Los Angeles Rams": "LAR", "Miami Dolphins": "MIA", "Minnesota Vikings": "MIN",
  "New England Patriots": "NE", "New Orleans Saints": "NO", "New York Giants": "NYG",
  "New York Jets": "NYJ", "Philadelphia Eagles": "PHI", "Pittsburgh Steelers": "PIT",
  "San Francisco 49ers": "SF", "Seattle Seahawks": "SEA", "Tampa Bay Buccaneers": "TB",
  "Tennessee Titans": "TEN", "Washington Commanders": "WAS",
};

// Bye weeks aren't in the projections export; placeholder cycled per team
// (2-3 teams share each week 5-14) so the app's bye-conflict check has real
// per-team data to work with. Replace with actual 2026 byes when known.
const TEAM_BYE = Object.fromEntries(
  Object.values(TEAM_NAME_TO_ABBR)
    .sort()
    .map((abbr, i) => [abbr, 5 + (i % 10)]),
);

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function loadPosition(position, file) {
  const text = readFileSync(path.join(PROJECTIONS_DIR, file), "utf8");
  const lines = text.split(/\r?\n/).slice(1); // drop header row
  const players = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells = parseCsvLine(line).map((c) => c.trim());
    const name = cells[0];
    if (!name) continue; // blank spacer row
    const fpts = Number(cells[cells.length - 1]);
    if (!Number.isFinite(fpts)) continue;

    let team = cells[1];
    if (position === "DST") team = TEAM_NAME_TO_ABBR[name] ?? "";

    players.push({ name, team, position, projectedPoints: fpts });
  }
  players.sort((a, b) => b.projectedPoints - a.projectedPoints);
  return players;
}

function replacementRank(position, byPosition) {
  const starters = {};
  for (const pos of Object.keys(POSITION_FILES)) starters[pos] = 0;
  starters.QB = TEAM_COUNT * ROSTER_SLOTS.QB;
  starters.RB = TEAM_COUNT * ROSTER_SLOTS.RB;
  starters.WR = TEAM_COUNT * ROSTER_SLOTS.WR;
  starters.TE = TEAM_COUNT * ROSTER_SLOTS.TE;
  starters.DST = TEAM_COUNT * ROSTER_SLOTS.DST;
  starters.K = TEAM_COUNT * ROSTER_SLOTS.K;

  let rank = starters[position];
  if (FLEX_ELIGIBLE.includes(position)) {
    const flexTotal = TEAM_COUNT * ROSTER_SLOTS.FLEX;
    const flexPoolStarters = FLEX_ELIGIBLE.reduce((s, p) => s + starters[p], 0);
    const flexShare = flexTotal * (starters[position] / flexPoolStarters);
    rank = Math.round(starters[position] + flexShare);
  }
  return Math.min(Math.max(rank, 1), byPosition[position].length);
}

function main() {
  const byPosition = {};
  for (const [position, file] of Object.entries(POSITION_FILES)) {
    byPosition[position] = loadPosition(position, file);
  }

  const baseline = {};
  for (const position of Object.keys(POSITION_FILES)) {
    const rank = replacementRank(position, byPosition);
    baseline[position] = byPosition[position][rank - 1]?.projectedPoints ?? 0;
  }

  const all = Object.values(byPosition)
    .flat()
    .map((p) => ({ ...p, vbd: p.projectedPoints - baseline[p.position] }))
    .sort((a, b) => b.vbd - a.vbd);

  const players = all.map((p, i) => {
    const rank = i + 1;
    return {
      id: `fp-${rank}`,
      rank,
      name: p.name,
      team: p.team,
      position: p.position,
      bye: TEAM_BYE[p.team] ?? null,
      tier: Math.ceil(rank / TEAM_COUNT),
      projectedPoints: Math.round(p.projectedPoints * 10) / 10,
      vbd: Math.round(p.vbd * 10) / 10,
    };
  });

  const body = players
    .map(
      (p) =>
        `  { id: ${JSON.stringify(p.id)}, rank: ${p.rank}, name: ${JSON.stringify(p.name)}, team: ${JSON.stringify(p.team)}, position: ${JSON.stringify(p.position)}, bye: ${p.bye}, tier: ${p.tier}, projectedPoints: ${p.projectedPoints}, vbd: ${p.vbd} },`,
    )
    .join("\n");

  const out = `import { Player } from "@/lib/types";

// Generated by \`npm run gen:players\` from the FantasyPros projection CSVs
// in src/data/fantasypros_projections/ — see scripts/generate-players.mjs.
// Ranked by static Value-Based Drafting: projectedPoints minus the
// position's replacement-level (last-starter) baseline for a ${TEAM_COUNT}-team
// league with roster slots ${JSON.stringify(ROSTER_SLOTS)}.
// Bye weeks are placeholders (projections exports don't include them).
export const SEED_PLAYERS: Player[] = [
${body}
];
`;

  writeFileSync(OUT_FILE, out);
  console.log(`Wrote ${players.length} players to ${path.relative(process.cwd(), OUT_FILE)}`);
  for (const position of Object.keys(POSITION_FILES)) {
    console.log(
      `  ${position}: ${byPosition[position].length} loaded, replacement baseline ${baseline[position].toFixed(1)} pts`,
    );
  }
}

// sanity check the projections dir actually has files before we wipe the output
if (readdirSync(PROJECTIONS_DIR).length === 0) {
  throw new Error(`No files found in ${PROJECTIONS_DIR}`);
}

main();
