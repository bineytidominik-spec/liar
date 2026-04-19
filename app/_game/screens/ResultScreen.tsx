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
  const { imposterNames, voteCounts, imposterCaught, topVoted } = result;
  const [guessSubmitted, setGuessSubmitted] = useState(false);
  const needsGuess = !imposterCaught;
  const canContinue = !needsGuess || guessSubmitted;
  const maxVotes = Math.max(1, ...Object.values(voteCounts));
  const multipleImposters = imposterNames.length > 1;

  return (
    <div className="fade-up flex-1 flex flex-col">
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-rose-400 mb-2">Auflösung</div>

      <div className={`border-l-4 ${imposterCaught ? 'border-green-400' : 'border-rose-500'} pl-4 mb-6`}>
        <div className={`font-mono-game text-xs uppercase tracking-widest mb-1 ${imposterCaught ? 'text-green-600' : 'text-rose-600'}`}>
          {imposterCaught ? 'Crew gewinnt' : `${multipleImposters ? 'Liars gewinnen' : 'Liar gewinnt'}`}
        </div>
        <div className="font-display text-3xl font-black italic text-stone-800">
          {imposterCaught ? 'Entlarvt.' : topVoted.length > 1 ? 'Keine Mehrheit.' : 'Unentdeckt.'}
        </div>
      </div>

      <div className="bg-white shadow-sm border border-stone-100 p-5 mb-6 space-y-3 rounded-xl">
        <div>
          <div className="font-mono-game text-[10px] uppercase tracking-widest text-stone-400 mb-1">
            {multipleImposters ? 'Die Liars waren' : 'Der Liar war'}
          </div>
          <div className="font-display text-2xl font-bold text-rose-600 break-words">
            {imposterNames.join(' & ')}
          </div>
        </div>
        <div>
          <div className="font-mono-game text-[10px] uppercase tracking-widest text-stone-400 mb-1">Das Wort</div>
          <div className="font-display text-2xl font-bold italic text-stone-800">{word.word}</div>
          {imposterMode === 'similar' && (
            <div className="text-xs text-stone-400 mt-1">Hinweis für {multipleImposters ? 'Liars' : 'Liar'}: <span className="text-stone-600">{word.association}</span></div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="font-mono-game text-[10px] uppercase tracking-widest text-stone-400 mb-2">Stimmen</div>
        <div className="space-y-1.5">
          {Object.entries(voteCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
            <div key={name} className="flex items-center gap-3">
              <div className="w-28 text-sm truncate text-stone-700">{name}{imposterNames.includes(name) && <span className="text-rose-500 ml-1">●</span>}</div>
              <div className="flex-1 bg-rose-100 h-2 rounded-full">
                <div className="bg-rose-400 h-full transition-all rounded-full" style={{ width: `${(count / maxVotes) * 100}%` }} />
              </div>
              <div className="font-mono-game text-xs text-stone-400 w-6 text-right">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {needsGuess && !guessSubmitted && (
        <div className="bg-rose-50 border border-rose-200 p-4 mb-6 fade-up rounded-xl">
          <div className="font-mono-game text-[10px] uppercase tracking-widest text-rose-500 mb-2">Bonus-Chance</div>
          <p className="text-sm text-stone-600 mb-3">
            <span className="font-bold">{multipleImposters ? imposterNames.join(' & ') : imposterNames[0]}</span>
            {multipleImposters ? ', erratet ihr das Wort?' : ', errätst du das Wort?'} (+1 Bonuspunkt)
          </p>
          <div className="flex gap-2">
            <input value={imposterGuess} onChange={e => setImposterGuess(e.target.value)} placeholder="Dein Tipp..."
              className="flex-1 bg-white border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-rose-400 text-stone-800 rounded-xl" />
            <button onClick={() => setGuessSubmitted(true)} className="px-4 bg-rose-500 text-white text-xs font-mono-game uppercase tracking-wider hover:bg-rose-600 rounded-xl">
              Abgeben
            </button>
          </div>
          <button onClick={() => { setImposterGuess(''); setGuessSubmitted(true); }} className="text-xs text-stone-400 mt-2 hover:text-stone-600 transition-colors">
            Überspringen
          </button>
        </div>
      )}

      <button onClick={onContinue} disabled={!canContinue}
        className="w-full py-4 bg-rose-500 text-white hover:bg-rose-600 font-mono-game text-sm uppercase tracking-[0.2em] disabled:opacity-40 transition-colors rounded-xl shadow-sm">
        Punkte vergeben →
      </button>
    </div>
  );
}
