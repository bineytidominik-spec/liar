import type { ImposterMode, WordSource, CustomWord, Scores } from './types';
import type { Category } from './wordpacks';

const STORAGE_KEY = 'hochstapler:game:v1';

export type PersistedState = {
  version: 1;
  savedAt: number;
  players: string[];
  scores: Scores;
  roundNumber: number;
  wordSource: WordSource;
  selectedCategories: Category[];
  customWords: CustomWord[];
  imposterMode: ImposterMode;
  discussionMinutes: number;
  playedWords: string[];
};

export function saveGame(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // iOS Safari private mode or storage full — fail silently
  }
}

export function loadGame(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // fail silently
  }
}
