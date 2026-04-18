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
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Punktestand</div>
      <h2 className="font-display text-2xl font-bold mb-6">Ranking.</h2>

      <div className="flex-1 space-y-2 mb-6">
        {sorted.map((p, i) => {
          const score = scores[p] || 0;
          return (
            <div key={p} className={`p-4 fade-up ${i === 0 ? 'bg-gradient-to-r from-red-950/40 to-transparent border-l-4 border-red-500' : 'bg-stone-900/40 border-l-2 border-stone-800'}`} style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span className={`font-mono-game text-xs ${i === 0 ? 'text-red-500' : 'text-stone-500'}`}>
                    {i === 0 ? '★' : String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-lg">{p}</span>
                </div>
                <span className={`font-display text-2xl font-black italic ${i === 0 ? 'text-red-500' : 'text-stone-300'}`}>{score}</span>
              </div>
              <div className="bg-stone-900 h-1">
                <div className={`h-full ${i === 0 ? 'bg-red-500' : 'bg-stone-600'}`} style={{ width: `${(score / maxScore) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mb-2">
        <button onClick={onEnd} className="px-5 py-3 bg-stone-900 text-stone-400 font-mono-game text-xs uppercase tracking-wider hover:bg-stone-800">
          Spiel beenden
        </button>
        <button onClick={onNextRound} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-mono-game text-sm uppercase tracking-[0.2em]">
          Nächste Runde →
        </button>
      </div>
      <button onClick={onResetScores} className="w-full py-2 text-stone-600 font-mono-game text-[10px] uppercase tracking-wider hover:text-stone-400 transition-colors">
        ↺ Scores zurücksetzen, Spieler behalten
      </button>
    </div>
  );
}
