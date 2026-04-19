'use client';

import { useState, useRef } from 'react';

export function PlayersScreen({ players, addPlayer, removePlayer, onContinue }: {
  players: string[];
  addPlayer: (name: string) => boolean;
  removePlayer: (name: string) => void;
  onContinue: () => void;
}) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (addPlayer(name)) { setName(''); inputRef.current?.focus(); }
  };

  return (
    <div className="fade-up">
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-rose-400 mb-2">Phase 01</div>
      <h2 className="font-display text-2xl font-bold mb-1">Wer spielt mit?</h2>
      <p className="text-stone-500 text-sm mb-6">Mindestens 3, maximal 15 Spieler.</p>

      <div className="flex gap-2 mb-6">
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Name eingeben..."
          maxLength={20}
          className="flex-1 bg-white border border-stone-200 px-4 py-3 focus:outline-none focus:border-rose-400 transition-colors text-stone-800 placeholder:text-stone-400"
        />
        <button
          onClick={handleAdd}
          disabled={!name.trim() || players.length >= 15}
          className="px-5 bg-stone-800 text-white font-mono-game text-xs uppercase tracking-wider hover:bg-rose-500 disabled:opacity-30 disabled:hover:bg-stone-800 transition-colors"
        >
          + Hinzu
        </button>
      </div>

      <div className="space-y-1.5 mb-8 max-h-[50vh] overflow-y-auto">
        {players.length === 0 && (
          <div className="text-stone-400 text-sm italic text-center py-8">Noch keine Spieler. Legt los.</div>
        )}
        {players.map((p, i) => (
          <div key={p} className="group flex items-center justify-between bg-white border-l-2 border-rose-400 px-4 py-2.5 fade-up shadow-sm" style={{ animationDelay: `${i * 30}ms` }}>
            <div className="flex items-center gap-3">
              <span className="font-mono-game text-xs text-stone-400">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-lg text-stone-800">{p}</span>
            </div>
            <button onClick={() => removePlayer(p)} className="opacity-40 hover:opacity-100 text-stone-400 hover:text-rose-500 transition-all text-xs">
              Entfernen
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        disabled={players.length < 3}
        className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-mono-game text-sm uppercase tracking-[0.2em] disabled:bg-stone-200 disabled:text-stone-400 transition-colors shadow-sm"
      >
        Weiter zur Runde →
      </button>
    </div>
  );
}
