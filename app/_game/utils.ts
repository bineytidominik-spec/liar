import type { WordEntry } from './wordpacks';

export const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const pickRandom = <T,>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export const pickWordAntiRepeat = (
  pool: WordEntry[],
  playedWords: Set<string>,
  onReset: () => void,
): WordEntry => {
  const unplayed = pool.filter(e => !playedWords.has(e.word));
  if (unplayed.length === 0) {
    onReset();
    return pickRandom(pool);
  }
  return pickRandom(unplayed);
};
