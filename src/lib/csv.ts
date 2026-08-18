import { Player, Position } from "./types";

const VALID_POSITIONS: Position[] = ["QB", "RB", "WR", "TE", "DST", "K"];

const HEADER_ALIASES: Record<string, string> = {
  rank: "rank",
  overallrank: "rank",
  overall: "rank",
  rk: "rank",
  player: "name",
  playername: "name",
  name: "name",
  team: "team",
  tm: "team",
  pos: "position",
  position: "position",
  bye: "bye",
  byeweek: "bye",
  tier: "tier",
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[^a-z]/g, "");
}

function normalizePosition(raw: string): Position | null {
  const cleaned = raw.trim().toUpperCase().replace(/[0-9]/g, "");
  const map: Record<string, Position> = {
    QB: "QB",
    RB: "RB",
    WR: "WR",
    TE: "TE",
    K: "K",
    PK: "K",
    DST: "DST",
    DEF: "DST",
    "D/ST": "DST",
  };
  const pos = map[cleaned];
  return pos && VALID_POSITIONS.includes(pos) ? pos : null;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result.map((s) => s.trim());
}

export interface CsvParseResult {
  players: Player[];
  skippedRows: number;
}

/**
 * Parses a CSV export (e.g. FantasyPros cheat sheet) into Player[].
 * Recognized headers (case-insensitive): Rank, Player/Name, Team, Position/Pos, Bye, Tier.
 * Rows missing a name or a recognizable position are skipped.
 */
export function parsePlayerCsv(text: string): CsvParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { players: [], skippedRows: 0 };

  const headerCells = splitCsvLine(lines[0]).map(normalizeHeader);
  const colIndex: Record<string, number> = {};
  headerCells.forEach((h, i) => {
    const key = HEADER_ALIASES[h];
    if (key) colIndex[key] = i;
  });

  const hasHeader = colIndex.name !== undefined;
  const dataLines = hasHeader ? lines.slice(1) : lines;
  // Fallback column order if there's no recognizable header: rank,name,team,position,bye
  if (!hasHeader) {
    colIndex.rank = 0;
    colIndex.name = 1;
    colIndex.team = 2;
    colIndex.position = 3;
    colIndex.bye = 4;
  }

  const players: Player[] = [];
  let skippedRows = 0;

  dataLines.forEach((line, i) => {
    const cells = splitCsvLine(line);
    const name = colIndex.name !== undefined ? cells[colIndex.name] : "";
    const posRaw =
      colIndex.position !== undefined ? cells[colIndex.position] : "";
    const position = posRaw ? normalizePosition(posRaw) : null;

    if (!name || !position) {
      skippedRows++;
      return;
    }

    const rankRaw =
      colIndex.rank !== undefined ? Number(cells[colIndex.rank]) : NaN;
    const byeRaw =
      colIndex.bye !== undefined ? Number(cells[colIndex.bye]) : NaN;
    const tierRaw =
      colIndex.tier !== undefined ? Number(cells[colIndex.tier]) : NaN;

    players.push({
      id: `import-${i}-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      rank: Number.isFinite(rankRaw) ? rankRaw : i + 1,
      name,
      team: colIndex.team !== undefined ? cells[colIndex.team] || "" : "",
      position,
      bye: Number.isFinite(byeRaw) ? byeRaw : null,
      tier: Number.isFinite(tierRaw) ? tierRaw : Math.ceil((i + 1) / 12),
    });
  });

  players.sort((a, b) => a.rank - b.rank);
  return { players, skippedRows };
}
