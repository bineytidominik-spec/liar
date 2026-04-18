'use client';

import type { ReactNode } from 'react';

export function Card3D({ flipped, isImposter, onFlip, onFlipBack, front, back }: {
  flipped: boolean;
  isImposter: boolean;
  onFlip: () => void;
  onFlipBack: () => void;
  front: ReactNode;
  back: ReactNode;
}) {
  return (
    <div className="card-3d w-full max-w-sm aspect-[3/4]">
      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
        <button
          onClick={!flipped ? onFlip : undefined}
          className="card-face w-full h-full bg-gradient-to-br from-stone-900 to-stone-950 border border-red-500/20 hover:border-red-500/60 transition-colors group overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.12),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative h-full flex flex-col items-center justify-center">
            {front}
          </div>
        </button>

        <button
          onClick={flipped ? onFlipBack : undefined}
          className={`card-face card-back w-full h-full border cursor-pointer ${
            isImposter
              ? 'bg-gradient-to-br from-red-950/40 to-stone-950 border-red-500/40'
              : 'bg-gradient-to-br from-stone-800 to-stone-950 border-stone-700'
          }`}
        >
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
            {back}
            <div className="absolute bottom-4 left-0 right-0 font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-500 text-center pulse-soft">
              Tippen zum Verdecken
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
