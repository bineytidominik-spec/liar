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
          className="card-face w-full h-full bg-white border border-rose-200 hover:border-rose-400 transition-colors group overflow-hidden cursor-pointer shadow-md"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,113,133,0.10),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative h-full flex flex-col items-center justify-center">
            {front}
          </div>
        </button>

        <button
          onClick={flipped ? onFlipBack : undefined}
          className={`card-face card-back w-full h-full border cursor-pointer shadow-md ${
            isImposter
              ? 'bg-gradient-to-br from-rose-50 to-red-50 border-rose-300'
              : 'bg-gradient-to-br from-white to-amber-50 border-amber-100'
          }`}
        >
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
            {back}
            <div className="absolute bottom-4 left-0 right-0 font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-400 text-center pulse-soft">
              Tippen zum Verdecken
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
