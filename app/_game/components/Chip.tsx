'use client';

export function Chip({ label, count, active, onClick }: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs transition-all ${
        active
          ? 'bg-stone-100 text-stone-900'
          : 'bg-transparent border border-stone-700 text-stone-400 hover:border-stone-500'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className="opacity-60 font-mono-game ml-1">{count}</span>
      )}
    </button>
  );
}
