import { Player, Position } from "@/lib/types";

// Bye week is placeholder data (cycled per team) so the bye-conflict feature
// has something to demonstrate. Replace this whole sheet via CSV import for
// real 2026 rankings/ADP/byes (e.g. export your cheat sheet from FantasyPros).
const TEAM_BYE: Record<string, number> = {
  ARI: 5, ATL: 6, BAL: 7, BUF: 8, CAR: 9, CHI: 10, CIN: 11, CLE: 12,
  DAL: 13, DEN: 14, DET: 5, GB: 6, HOU: 7, IND: 8, JAX: 9, KC: 10,
  LAC: 11, LAR: 12, LV: 13, MIA: 14, MIN: 5, NE: 6, NO: 7, NYG: 8,
  NYJ: 9, PHI: 10, PIT: 11, SF: 12, SEA: 13, TB: 14, TEN: 5, WAS: 6,
};

// [name, team, position]
const RAW: [string, string, Position][] = [
  ["Ja'Marr Chase", "CIN", "WR"], ["Bijan Robinson", "ATL", "RB"], ["Justin Jefferson", "MIN", "WR"],
  ["CeeDee Lamb", "DAL", "WR"], ["Jahmyr Gibbs", "DET", "RB"], ["Saquon Barkley", "PHI", "RB"],
  ["Malik Nabers", "NYG", "WR"], ["Amon-Ra St. Brown", "DET", "WR"], ["Puka Nacua", "LAR", "WR"],
  ["Christian McCaffrey", "SF", "RB"], ["Nico Collins", "HOU", "WR"], ["De'Von Achane", "MIA", "RB"],
  ["Ashton Jeanty", "LV", "RB"], ["Brian Thomas Jr.", "JAX", "WR"], ["Derrick Henry", "BAL", "RB"],
  ["Josh Allen", "BUF", "QB"], ["A.J. Brown", "PHI", "WR"], ["Jonathan Taylor", "IND", "RB"],
  ["Drake London", "ATL", "WR"], ["Ladd McConkey", "LAC", "WR"], ["Brock Bowers", "LV", "TE"],
  ["Lamar Jackson", "BAL", "QB"], ["Josh Jacobs", "GB", "RB"], ["Marvin Harrison Jr.", "ARI", "WR"],
  ["Bucky Irving", "TB", "RB"], ["Kyren Williams", "LAR", "RB"], ["Tee Higgins", "CIN", "WR"],
  ["Garrett Wilson", "NYJ", "WR"], ["James Cook", "BUF", "RB"], ["Chase Brown", "CIN", "RB"],
  ["Terry McLaurin", "WAS", "WR"], ["Jayden Daniels", "WAS", "QB"], ["Breece Hall", "NYJ", "RB"],
  ["DK Metcalf", "PIT", "WR"], ["Trey McBride", "ARI", "TE"], ["Omarion Hampton", "LAC", "RB"],
  ["Davante Adams", "LAR", "WR"], ["Mike Evans", "TB", "WR"], ["Patrick Mahomes", "KC", "QB"],
  ["Alvin Kamara", "NO", "RB"], ["DJ Moore", "CHI", "WR"], ["Zay Flowers", "BAL", "WR"],
  ["Kenneth Walker III", "SEA", "RB"], ["Joe Burrow", "CIN", "QB"], ["James Conner", "ARI", "RB"],
  ["Chris Olave", "NO", "WR"], ["Jaxon Smith-Njigba", "SEA", "WR"], ["Sam LaPorta", "DET", "TE"],
  ["Joe Mixon", "HOU", "RB"], ["Xavier Worthy", "KC", "WR"], ["Aaron Jones", "MIN", "RB"],
  ["C.J. Stroud", "HOU", "QB"], ["George Kittle", "SF", "TE"], ["D'Andre Swift", "CHI", "RB"],
  ["Rome Odunze", "CHI", "WR"], ["Tony Pollard", "TEN", "RB"], ["Jameson Williams", "DET", "WR"],
  ["Jalen Hurts", "PHI", "QB"], ["Jayden Reed", "GB", "WR"], ["Rhamondre Stevenson", "NE", "RB"],
  ["Courtland Sutton", "DEN", "WR"], ["Bo Nix", "DEN", "QB"], ["Chuba Hubbard", "CAR", "RB"],
  ["Calvin Ridley", "TEN", "WR"], ["Javonte Williams", "DAL", "RB"], ["Mark Andrews", "BAL", "TE"],
  ["Tank Dell", "HOU", "WR"], ["Deebo Samuel", "WAS", "WR"], ["Tyrone Tracy Jr.", "NYG", "RB"],
  ["Brock Purdy", "SF", "QB"], ["George Pickens", "DAL", "WR"], ["Isiah Pacheco", "KC", "RB"],
  ["Brandon Aiyuk", "SF", "WR"], ["Justin Herbert", "LAC", "QB"], ["Keenan Allen", "CHI", "WR"],
  ["Zach Charbonnet", "SEA", "RB"], ["Evan Engram", "DEN", "TE"], ["Jerry Jeudy", "CLE", "WR"],
  ["Ray Davis", "BUF", "RB"], ["Amari Cooper", "BUF", "WR"], ["Kyler Murray", "ARI", "QB"],
  ["Diontae Johnson", "CAR", "WR"], ["Brian Robinson Jr.", "WAS", "RB"], ["Jakobi Meyers", "LV", "WR"],
  ["Cooper Kupp", "SEA", "WR"], ["Rachaad White", "TB", "RB"], ["Michael Pittman Jr.", "IND", "WR"],
  ["Jaylen Warren", "PIT", "RB"], ["Kyle Pitts", "ATL", "TE"], ["Rashee Rice", "KC", "WR"],
  ["Najee Harris", "LAC", "RB"], ["Jared Goff", "DET", "QB"], ["Stefon Diggs", "NE", "WR"],
  ["Dalton Kincaid", "BUF", "TE"], ["Khalil Shakir", "BUF", "WR"], ["Austin Ekeler", "WAS", "RB"],
  ["Baker Mayfield", "TB", "QB"], ["Josh Downs", "IND", "WR"], ["Tank Bigsby", "JAX", "RB"],
  ["Tyler Lockett", "TEN", "WR"], ["J.K. Dobbins", "DEN", "RB"], ["Adam Thielen", "CAR", "WR"],
  ["David Njoku", "CLE", "TE"], ["TreVeyon Henderson", "NE", "RB"], ["Curtis Samuel", "BUF", "WR"],
  ["Dak Prescott", "DAL", "QB"], ["RJ Harvey", "DEN", "RB"], ["Wan'Dale Robinson", "NYG", "WR"],
  ["Jauan Jennings", "SF", "WR"], ["Trey Benson", "ARI", "RB"], ["Dallas Goedert", "PHI", "TE"],
  ["Romeo Doubs", "GB", "WR"], ["Trevor Lawrence", "JAX", "QB"], ["Braelon Allen", "NYJ", "RB"],
  ["Darnell Mooney", "ATL", "WR"], ["T.J. Hockenson", "MIN", "TE"], ["Jerome Ford", "CLE", "RB"],
  ["Caleb Williams", "CHI", "QB"], ["Devin Singletary", "NYG", "RB"], ["Jordan Addison", "MIN", "WR"],
  ["Cam Akers", "HOU", "RB"], ["Marquise Brown", "KC", "WR"], ["Cole Kmet", "CHI", "TE"],
  ["Anthony Richardson", "IND", "QB"], ["Ty Chandler", "MIN", "RB"], ["Rashid Shaheed", "NO", "WR"],
  ["Antonio Gibson", "NE", "RB"], ["Ricky Pearsall", "SF", "WR"], ["Matthew Stafford", "LAR", "QB"],
  ["Roschon Johnson", "CHI", "RB"], ["Keon Coleman", "BUF", "WR"], ["Tucker Kraft", "GB", "TE"],
  ["Jaylen Wright", "MIA", "RB"], ["Ja'Lynn Polk", "NE", "WR"], ["Geno Smith", "LV", "QB"],
  ["MarShawn Lloyd", "GB", "RB"], ["Tutu Atwell", "LAR", "WR"], ["Colston Loveland", "CHI", "TE"],
  ["Blake Corum", "LAR", "RB"], ["Demario Douglas", "NE", "WR"], ["Drake Maye", "NE", "QB"],
  ["Zamir White", "LV", "RB"], ["Elijah Moore", "CLE", "WR"], ["Isaiah Likely", "BAL", "TE"],
  ["Sean Tucker", "TB", "RB"], ["Nelson Agholor", "BAL", "WR"], ["Dameon Pierce", "HOU", "RB"],
  ["Gabe Davis", "JAX", "WR"], ["Pat Freiermuth", "PIT", "TE"], ["Miles Sanders", "DAL", "RB"],
  ["Kalif Raymond", "DET", "WR"], ["Justice Hill", "BAL", "RB"], ["Josh Palmer", "LAC", "WR"],
  ["Hunter Henry", "NE", "TE"], ["Kareem Hunt", "KC", "RB"], ["Jalen Tolbert", "DAL", "WR"],
  ["Zach Ertz", "WAS", "TE"], ["Chig Okonkwo", "TEN", "TE"],
  ["Broncos D/ST", "DEN", "DST"], ["Steelers D/ST", "PIT", "DST"], ["Eagles D/ST", "PHI", "DST"],
  ["Ravens D/ST", "BAL", "DST"], ["49ers D/ST", "SF", "DST"], ["Jets D/ST", "NYJ", "DST"],
  ["Texans D/ST", "HOU", "DST"], ["Cowboys D/ST", "DAL", "DST"], ["Bills D/ST", "BUF", "DST"],
  ["Vikings D/ST", "MIN", "DST"], ["Packers D/ST", "GB", "DST"], ["Dolphins D/ST", "MIA", "DST"],
  ["Justin Tucker", "BAL", "K"], ["Brandon Aubrey", "DAL", "K"], ["Chris Boswell", "PIT", "K"],
  ["Harrison Butker", "KC", "K"], ["Cameron Dicker", "LAC", "K"], ["Jake Elliott", "PHI", "K"],
  ["Younghoe Koo", "ATL", "K"], ["Tyler Bass", "BUF", "K"], ["Ka'imi Fairbairn", "HOU", "K"],
  ["Jason Sanders", "MIA", "K"], ["Wil Lutz", "DEN", "K"], ["Chase McLaughlin", "TB", "K"],
];

export const SEED_PLAYERS: Player[] = RAW.map(([name, team, position], i) => {
  const rank = i + 1;
  return {
    id: `seed-${rank}`,
    rank,
    name,
    team,
    position,
    bye: TEAM_BYE[team] ?? null,
    tier: Math.ceil(rank / 12),
  };
});
