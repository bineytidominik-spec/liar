'use client';

import type { Scores } from '../types';

export function ScoreboardScreen({ scores, players, onNextRound, onEnd, onResetScores }: {
  scores: Scores;
  players: string[];
  onNextRound: () => void;
  onEnd: () => void;
  onResetScores: () => void;
}) {
  const sorted = [...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
  const maxScore = Math.max(...Object.values(scores), 1);

  return (
    <div className="fade-up flex-1 flex flex-col">
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-rose-400 mb-2">Punktestand</div>
      <h2 className="font-display text-2xl font-bold mb-6 text-stone-800">Ranking.</h2>

      <div className="flex-1 space-y-2 mb-6">
        {sorted.map((p, i) => {
          const score = scores[p] || 0;
          return (
            <div key={p} className={`p-4 fade-up rounded-xl shadow-sm ${i === 0 ? 'bg-gradient-to-r from-rose-100 to-white border-l-4 border-rose-500' : 'bg-white border-l-2 border-stone-200'}`} style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span className={`font-mono-game text-xs ${i === 0 ? 'text-rose-500' : 'text-stone-400'}`}>
                    {i === 0 ? '★' : String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-lg text-stone-800">{p}</span>
                </div>
                <span className={`font-display text-2xl font-black italic ${i === 0 ? 'text-rose-500' : 'text-stone-500'}`}>{score}</span>
              </div>
              <div className="bg-rose-100 h-1 rounded-full">
                <div className={`h-full rounded-full ${i === 0 ? 'bg-rose-400' : 'bg-stone-300'}`} style={{ width: `${(score / maxScore) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mb-2">
        <button onClick={onEnd} className="px-5 py-3 bg-white border border-stone-200 text-stone-500 font-mono-game text-xs uppercase tracking-wider hover:bg-rose-50 hover:border-rose-200 transition-colors rounded-xl shadow-sm">
          Spiel beenden
        </button>
        <button onClick={onNextRound} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-mono-game text-sm uppercase tracking-[0.2em] rounded-xl shadow-sm transition-colors">
          Nächste Runde →
        </button>
      </div>
      <button onClick={onResetScores} className="w-full py-2 text-stone-400 font-mono-game text-[10px] uppercase tracking-wider hover:text-rose-500 transition-colors">
        ↺ Scores zurücksetzen, Spieler behalten
      </button>
    </div>
  );
}
