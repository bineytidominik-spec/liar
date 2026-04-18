'use client';

export function VoteScreen({ voter, candidates, onVote, idx, total }: {
  voter: string;
  candidates: string[];
  onVote: (name: string) => void;
  idx: number;
  total: number;
}) {
  return (
    <div className="fade-up flex-1 flex flex-col">
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">
        Stimme {idx + 1} von {total}
      </div>
      <h2 className="font-display text-2xl font-bold mb-2">
        <span className="text-red-500">{voter}</span>, wen verdächtigst du?
      </h2>
      <p className="text-stone-400 text-sm mb-6 italic">Handy wandert weiter — einer nach dem anderen.</p>

      <div className="space-y-1.5 flex-1 overflow-y-auto">
        {candidates.map(p => (
          <button
            key={p}
            onClick={() => onVote(p)}
            disabled={p === voter}
            className="w-full text-left px-4 py-3.5 bg-stone-900/40 border-l-2 border-stone-800 hover:border-red-500 hover:bg-stone-900 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-stone-800 disabled:hover:bg-stone-900/40 font-display text-lg transition-all"
          >
            {p} {p === voter && <span className="text-xs text-stone-600 font-mono-game ml-2">(du)</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
