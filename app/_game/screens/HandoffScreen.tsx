'use client';

import { useState } from 'react';

export function HandoffScreen({ playerName, turnIdx, total, onContinue }: {
  playerName: string;
  turnIdx: number;
  total: number;
  onContinue: () => void;
}) {
  const [transitioning, setTransitioning] = useState(false);

  const handleTap = () => {
    if (transitioning) return;
    setTransitioning(true);
    onContinue();
  };

  return (
    <div
      className="fade-up flex-1 flex flex-col items-center justify-center text-center cursor-pointer select-none"
      onClick={handleTap}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleTap()}
    >
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-4">
        {turnIdx + 1} von {total}
      </div>
      <div className="font-mono-game text-xs uppercase tracking-widest text-stone-500 mb-3">Das Handy geht an</div>
      <h2 className="font-display text-5xl font-black italic text-rose-500 mb-10 break-words max-w-full px-4">
        {playerName}
      </h2>
      <div className="font-mono-game text-xs uppercase tracking-[0.25em] text-stone-400 pulse-soft">
        Tippen, um die Karte zu sehen
      </div>
    </div>
  );
}
