'use client';

import { Card3D } from '../components/Card3D';
import type { CurrentWord, ImposterMode } from '../types';

export function RevealScreen({ playerName, isImposter, word, imposterMode, flipped, onFlip, onFlipBack, turnIdx, total }: {
  playerName: string;
  isImposter: boolean;
  word: CurrentWord;
  imposterMode: ImposterMode;
  flipped: boolean;
  onFlip: () => void;
  onFlipBack: () => void;
  turnIdx: number;
  total: number;
}) {
  const front = (
    <>
      <div className="font-mono-game text-[10px] uppercase tracking-[0.4em] text-stone-400 mb-4">Für</div>
      <div className="font-display text-3xl sm:text-4xl font-black italic text-stone-800 mb-6 px-4 text-center break-words">{playerName}</div>
      <div className="font-display text-6xl font-black text-rose-400 italic">?</div>
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-400 mt-6 px-4 text-center">
        Tippen zum Aufdecken
      </div>
    </>
  );

  const back = isImposter ? (
    <>
      <div className="font-mono-game text-[10px] uppercase tracking-[0.4em] text-rose-500 mb-6">Deine Rolle</div>
      <div className="font-display text-5xl sm:text-6xl font-black italic text-rose-600 mb-6">BLENDER</div>
      {imposterMode === 'similar' ? (
        <>
          <div className="font-mono-game text-[10px] uppercase tracking-widest text-stone-500 mb-2">Dein Hinweis</div>
          <div className="font-display text-2xl sm:text-3xl italic text-stone-700 mb-6">{word.association}</div>
          <div className="text-stone-500 text-xs italic px-4">Passt irgendwie. Bluff dich durch.</div>
        </>
      ) : (
        <div className="text-stone-500 text-sm italic max-w-xs">
          Du kennst das Wort nicht.<br />Hör zu und bluff dich durch.
        </div>
      )}
    </>
  ) : (
    <>
      <div className="font-mono-game text-[10px] uppercase tracking-[0.4em] text-stone-400 mb-6">Dein Wort</div>
      <div className="font-display text-4xl sm:text-5xl font-black italic text-stone-800 break-words">{word.word}</div>
      <div className="mt-8 text-stone-400 text-xs italic">Einer am Tisch kennt dieses Wort nicht.</div>
    </>
  );

  return (
    <div className="fade-up flex-1 flex flex-col">
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-2">
        {turnIdx + 1} von {total} · <span className="text-stone-600">{playerName}</span>
      </div>
      <div className="flex-1 flex items-center justify-center py-4">
        <Card3D
          flipped={flipped}
          isImposter={isImposter}
          onFlip={onFlip}
          onFlipBack={onFlipBack}
          front={front}
          back={back}
        />
      </div>
    </div>
  );
}
