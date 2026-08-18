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

The app ships with a built-in ~180-player starter cheat sheet (rank, team,
position, tier, and a placeholder bye week) so it works out of the box. For
accurate, current rankings/ADP/bye weeks, use the "Upload CSV" / paste-CSV
option on the setup screen — it accepts an export from FantasyPros or any
sheet with `Rank, Player, Team, Position, Bye` columns (header names are
matched case-insensitively; extra columns are ignored).

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
