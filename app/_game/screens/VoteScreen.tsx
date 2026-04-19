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
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-rose-400 mb-2">
        Stimme {idx + 1} von {total}
      </div>
      <h2 className="font-display text-2xl font-bold mb-2 break-words text-stone-800">
        <span className="text-rose-500">{voter}</span>, wen verdächtigst du?
      </h2>
      <p className="text-stone-500 text-sm mb-6 italic">Handy wandert weiter — einer nach dem anderen.</p>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {candidates.map(p => (
          <button
            key={p}
            onClick={() => onVote(p)}
            disabled={p === voter}
            className="w-full text-left px-4 py-3.5 bg-white border-l-4 border-rose-200 hover:border-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-rose-200 disabled:hover:bg-white font-display text-lg text-stone-800 transition-all rounded-xl shadow-sm"
          >
            {p} {p === voter && <span className="text-xs text-stone-400 font-mono-game ml-2">(du)</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
