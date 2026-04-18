'use client';

export function HandoffScreen({ playerName, turnIdx, total, onContinue }: {
  playerName: string;
  turnIdx: number;
  total: number;
  onContinue: () => void;
}) {
  return (
    <div className="fade-up flex-1 flex flex-col items-center justify-center text-center">
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-4">
        {turnIdx + 1} von {total}
      </div>
      <div className="font-mono-game text-xs uppercase tracking-widest text-stone-400 mb-3">Das Handy geht an</div>
      <h2 className="font-display text-5xl font-black italic text-red-500 mb-2 break-words max-w-full px-4">
        {playerName}
      </h2>
      <div className="text-stone-500 text-sm italic mb-12">Bereit? Tippe, um die Karte zu sehen.</div>
      <button
        onClick={onContinue}
        className="px-10 py-4 bg-stone-100 text-stone-900 font-mono-game text-sm uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-colors active:scale-95"
      >
        Ich bin&apos;s →
      </button>
    </div>
  );
}
