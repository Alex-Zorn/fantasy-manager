# Fantasy Draft Assistant

A live fantasy football draft tracker: mark picks as they happen (yours or
anyone else's), and it keeps snake-draft order, best-available rankings,
your roster/needs, and bye-week conflicts up to date automatically.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

This is a static, client-only Next.js app (no backend/database — draft
state is saved to your browser's `localStorage`), so it deploys anywhere
that hosts a Next.js app, e.g. [Vercel](https://vercel.com/new).

## Player data

The built-in cheat sheet (`src/data/players.ts`) is generated from
FantasyPros season projection CSVs in
`src/data/fantasypros_projections/` and ranked by **static Value-Based
Drafting**: each player's projected points minus their position's
replacement-level baseline (the "last starter" the league would still be
drafting — starters implied by team count and roster slots, with FLEX
allocated across RB/WR/TE proportional to their starter counts). This is
why the top of the sheet is RB/WR-heavy rather than just "most points" —
a replacement-level RB is worse than a replacement-level QB, so top RBs
carry more marginal value. See `scripts/generate-players.mjs` for the
exact algorithm.

To refresh it: download new projection CSVs from FantasyPros into
`src/data/fantasypros_projections/` (same six files — QB/RB/WR/TE/K/DST),
then run:

```bash
npm run gen:players
```

Bye weeks aren't in the projections export, so they're placeholder values
cycled per team — replace them via CSV import (below) if you need real
ones. You can also skip the generated sheet entirely and use the "Upload
CSV" / paste-CSV option on the setup screen, which accepts any sheet with
`Rank, Player, Team, Position, Bye` columns (header names matched
case-insensitively; extra columns ignored).

## How a draft works

1. On the setup screen, set team count, scoring, roster slots, and your
   draft slot, then **Start Draft**.
2. As each pick happens in your real draft (yours or another team's), find
   the player in the pool and click **Draft**. The app tracks whose turn it
   is via snake order, so you don't need to specify which team — just mark
   the player taken.
3. The right-hand panel shows best-available players by position, your
   roster/remaining needs, and any bye-week conflicts, plus a full pick log
   with **Undo last pick**.

Use **Reset draft** to clear all picks and start over (settings and loaded
rankings are kept).
