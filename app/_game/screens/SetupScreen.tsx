'use client';

import type { PersistedState } from '../storage';

export function SetupScreen({ onStart, onResume, savedGame }: {
  onStart: () => void;
  onResume: () => void;
  savedGame: PersistedState | null;
}) {
  const savedDate = savedGame
    ? new Date(savedGame.savedAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center fade-up">
      <div className="max-w-md">
        <div className="font-mono-game text-xs uppercase tracking-[0.4em] text-rose-400 mb-6">— Wer lügt? —</div>
        <p className="font-display text-xl italic text-stone-600 leading-relaxed mb-12">
          Alle kennen das Wort.<br />
          Einer tut so, als ob.<br />
          <span className="text-rose-600 not-italic font-black">Findet ihn.</span>
        </p>

        <div className="space-y-3">
          <button
            onClick={onStart}
            className="w-full px-10 py-4 bg-rose-500 hover:bg-rose-600 text-white font-mono-game text-sm uppercase tracking-[0.2em] transition-all active:scale-95 rounded-xl shadow-sm"
          >
            Spiel starten
          </button>

          {savedGame && (
            <button
              onClick={onResume}
              className="w-full px-10 py-3 bg-white border border-rose-200 hover:bg-rose-50 text-stone-600 font-mono-game text-xs uppercase tracking-[0.2em] transition-all rounded-xl shadow-sm"
            >
              <div>Letztes Spiel fortsetzen</div>
              <div className="text-stone-400 normal-case tracking-normal mt-0.5 text-[10px]">
                {savedGame.players.length} Spieler · {savedDate}
              </div>
            </button>
          )}
        </div>

        <div className="mt-12 font-mono-game text-[10px] uppercase tracking-widest text-stone-400 space-y-1">
          <div>3–15 Spieler · Pass &amp; Play</div>
          <div>Ein Handy reicht</div>
        </div>
      </div>
    </div>
  );
}
