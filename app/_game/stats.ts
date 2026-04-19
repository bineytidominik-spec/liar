export type GameStats = {
  roundsPlayed: number;
  crewWins: number;
  liarWins: number;
};

const STATS_KEY = 'liar:stats';

export function loadStats(): GameStats {
  if (typeof window === 'undefined') return { roundsPlayed: 0, crewWins: 0, liarWins: 0 };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { roundsPlayed: 0, crewWins: 0, liarWins: 0 };
    const parsed = JSON.parse(raw) as GameStats;
    return {
      roundsPlayed: parsed.roundsPlayed ?? 0,
      crewWins: parsed.crewWins ?? 0,
      liarWins: parsed.liarWins ?? 0,
    };
  } catch {
    return { roundsPlayed: 0, crewWins: 0, liarWins: 0 };
  }
}

export function resetStats(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STATS_KEY);
}

export function recordRound(crewWon: boolean): void {
  if (typeof window === 'undefined') return;
  const stats = loadStats();
  const next: GameStats = {
    roundsPlayed: stats.roundsPlayed + 1,
    crewWins: stats.crewWins + (crewWon ? 1 : 0),
    liarWins: stats.liarWins + (crewWon ? 0 : 1),
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(next));
}
