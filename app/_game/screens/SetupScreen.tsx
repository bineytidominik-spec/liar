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
        <div className="font-mono-game text-xs uppercase tracking-[0.4em] text-red-500/80 mb-6">— Wer lügt? —</div>
        <p className="font-display text-xl italic text-stone-300 leading-relaxed mb-12">
          Alle kennen das Wort.<br />
          Einer tut so, als ob.<br />
          <span className="text-red-500 not-italic font-black">Findet ihn.</span>
        </p>

        <div className="space-y-3">
          <button
            onClick={onStart}
            className="w-full px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-mono-game text-sm uppercase tracking-[0.2em] transition-all active:scale-95"
            style={{ clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}
          >
            Spiel starten
          </button>

          {savedGame && (
            <button
              onClick={onResume}
              className="w-full px-10 py-3 bg-stone-900 border border-stone-700 hover:border-red-500/60 text-stone-300 font-mono-game text-xs uppercase tracking-[0.2em] transition-all"
            >
              <div>Letztes Spiel fortsetzen</div>
              <div className="text-stone-500 normal-case tracking-normal mt-0.5 text-[10px]">
                {savedGame.players.length} Spieler · {savedDate}
              </div>
            </button>
          )}
        </div>

        <div className="mt-12 font-mono-game text-[10px] uppercase tracking-widest text-stone-600 space-y-1">
          <div>3–15 Spieler · Pass &amp; Play</div>
          <div>Ein Handy reicht</div>
        </div>
      </div>
    </div>
  );
}
