import type { ImposterMode, WordSource, CustomWord, Scores } from './types';
import type { Category } from './wordpacks';

const STORAGE_KEY = 'hochstapler:game:v1';

/**
 * Läuft die App als native iOS-App (Capacitor)?
 * Auf Vercel/Web ist window.Capacitor nicht vorhanden.
 */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

export type PersistedState = {
  version: 1;
  savedAt: number;
  players: string[];
  roundNumber: number;
  wordSource: WordSource;
  selectedCategories: Category[];
  customWords: CustomWord[];
  imposterMode: ImposterMode;
  discussionMinutes: number;
  playedWords: string[];
  imposterCount: number;
  // Nur auf iOS persistiert; auf Web wird dieses Feld ignoriert
  scores?: Scores;
};

export function saveGame(state: PersistedState): void {
  try {
    const toSave: PersistedState = isNativeApp()
      ? state                          // iOS: alles inkl. Scores speichern
      : { ...state, scores: undefined }; // Web: Scores weglassen
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
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
    if (!parsed.imposterCount) parsed.imposterCount = 1;
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
