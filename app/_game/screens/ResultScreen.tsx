'use client';

import { useState } from 'react';
import type { CurrentWord, ImposterMode, ResultData } from '../types';

export function ResultScreen({ result, word, imposterMode, imposterGuess, setImposterGuess, onContinue }: {
  result: ResultData;
  word: CurrentWord;
  imposterMode: ImposterMode;
  imposterGuess: string;
  setImposterGuess: (v: string) => void;
  onContinue: () => void;
}) {
  const { imposterName, voteCounts, imposterCaught, topVoted } = result;
  const [guessSubmitted, setGuessSubmitted] = useState(false);
  const needsGuess = !imposterCaught;
  const canContinue = !needsGuess || guessSubmitted;
  const maxVotes = Math.max(1, ...Object.values(voteCounts));

  return (
    <div className="fade-up flex-1 flex flex-col">
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Auflösung</div>

      <div className={`border-l-4 ${imposterCaught ? 'border-green-500' : 'border-red-500'} pl-4 mb-6`}>
        <div className={`font-mono-game text-xs uppercase tracking-widest mb-1 ${imposterCaught ? 'text-green-500' : 'text-red-500'}`}>
          {imposterCaught ? 'Crew gewinnt' : 'Hochstapler gewinnt'}
        </div>
        <div className="font-display text-3xl font-black italic">
          {imposterCaught ? 'Entlarvt.' : topVoted.length > 1 ? 'Keine Mehrheit.' : 'Unentdeckt.'}
        </div>
      </div>

      <div className="bg-stone-900/40 p-5 mb-6 space-y-3">
        <div>
          <div className="font-mono-game text-[10px] uppercase tracking-widest text-stone-500 mb-1">Der Hochstapler war</div>
          <div className="font-display text-2xl font-bold text-red-500">{imposterName}</div>
        </div>
        <div>
          <div className="font-mono-game text-[10px] uppercase tracking-widest text-stone-500 mb-1">Das Wort</div>
          <div className="font-display text-2xl font-bold italic">{word.word}</div>
          {imposterMode === 'similar' && (
            <div className="text-xs text-stone-500 mt-1">Hinweis für Imposter: <span className="text-stone-300">{word.association}</span></div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="font-mono-game text-[10px] uppercase tracking-widest text-stone-500 mb-2">Stimmen</div>
        <div className="space-y-1">
          {Object.entries(voteCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
            <div key={name} className="flex items-center gap-3">
              <div className="w-28 text-sm truncate">{name}{name === imposterName && <span className="text-red-500 ml-1">●</span>}</div>
              <div className="flex-1 bg-stone-900 h-2">
                <div className="bg-red-500 h-full transition-all" style={{ width: `${(count / maxVotes) * 100}%` }} />
              </div>
              <div className="font-mono-game text-xs text-stone-400 w-6 text-right">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {needsGuess && !guessSubmitted && (
        <div className="bg-red-950/30 border border-red-500/30 p-4 mb-6 fade-up">
          <div className="font-mono-game text-[10px] uppercase tracking-widest text-red-500 mb-2">Bonus-Chance</div>
          <p className="text-sm text-stone-300 mb-3">
            <span className="font-bold">{imposterName}</span>, errätst du das Wort? (+1 Bonuspunkt)
          </p>
          <div className="flex gap-2">
            <input value={imposterGuess} onChange={e => setImposterGuess(e.target.value)} placeholder="Dein Tipp..."
              className="flex-1 bg-stone-900 border border-stone-800 px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
            <button onClick={() => setGuessSubmitted(true)} className="px-4 bg-red-600 text-white text-xs font-mono-game uppercase tracking-wider">
              Abgeben
            </button>
          </div>
          <button onClick={() => { setImposterGuess(''); setGuessSubmitted(true); }} className="text-xs text-stone-500 mt-2 hover:text-stone-300">
            Überspringen
          </button>
        </div>
      )}

      <button onClick={onContinue} disabled={!canContinue}
        className="w-full py-4 bg-stone-100 text-stone-900 hover:bg-red-500 hover:text-white font-mono-game text-sm uppercase tracking-[0.2em] disabled:opacity-40 transition-colors">
        Punkte vergeben →
      </button>
    </div>
  );
}
