'use client';

import { useState } from 'react';
import { WORD_PACKS, NEW_CATEGORIES } from '../wordpacks';
import type { Category } from '../wordpacks';
import type { ImposterMode } from '../types';

export function ConfigScreen({
  selectedCategories, setSelectedCategories,
  imposterMode, setImposterMode,
  imposterCount, setImposterCount,
  discussionMinutes, setDiscussionMinutes,
  poolSize, unplayedCount, onResetHistory,
  soundEnabled, onToggleSound, playerCount,
}: {
  soundEnabled: boolean;
  onToggleSound: () => void;
  playerCount: number;
  selectedCategories: Category[];
  setSelectedCategories: (v: Category[]) => void;
  imposterMode: ImposterMode;
  setImposterMode: (v: ImposterMode) => void;
  imposterCount: number;
  setImposterCount: (v: number) => void;
  discussionMinutes: number;
  setDiscussionMinutes: (v: number) => void;
  poolSize: number;
  unplayedCount: number;
  onResetHistory: () => void;
}) {
  const [showPicker, setShowPicker] = useState(false);

  const allCats = Object.keys(WORD_PACKS) as Category[];
  const isRandom = selectedCategories.length === allCats.length || selectedCategories.length === 0;

  const toggleCategory = (cat: Category) => {
    if (selectedCategories.includes(cat)) {
      const next = selectedCategories.filter(c => c !== cat);
      setSelectedCategories(next.length === 0 ? allCats : next);
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const selectRandom = () => {
    setSelectedCategories(allCats);
    setShowPicker(false);
  };

  const maxImposters = Math.max(1, Math.floor(playerCount / 3));
  const imposterOptions = Array.from({ length: maxImposters }, (_, i) => i + 1);

  const btnActive = 'bg-rose-500 text-white rounded-xl shadow-sm';
  const btnInactive = 'bg-white border border-stone-200 text-stone-500 hover:border-rose-300 rounded-xl';

  const categoryLabel = isRandom
    ? 'Zufällig'
    : selectedCategories.length === 1
      ? selectedCategories[0]
      : `${selectedCategories.length} Kategorien`;

  return (
    <div className="fade-up space-y-6 pb-4">

      <div>
        <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-rose-400 mb-2">Phase 02</div>
        <h2 className="font-display text-2xl font-bold mb-1 text-stone-800">Spielregeln</h2>
      </div>

      {/* Kategorie — kompakt, ausklappbar */}
      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-500 mb-2">Kategorie</div>
        <button
          onClick={() => setShowPicker(v => !v)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
            showPicker
              ? 'bg-rose-50 border-rose-300 text-rose-700'
              : 'bg-white border-stone-200 text-stone-700 hover:border-rose-300'
          }`}
        >
          <span className="font-mono-game text-xs uppercase tracking-wider">{categoryLabel}</span>
          <span className="font-mono-game text-[10px] text-stone-400">{showPicker ? '▲' : '▾'}</span>
        </button>

        {showPicker && (
          <div className="mt-3 fade-up space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={selectRandom}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all font-mono-game uppercase tracking-wider ${
                  isRandom ? 'bg-rose-500 text-white shadow-sm' : 'bg-white border border-stone-200 text-stone-500 hover:border-rose-300'
                }`}
              >
                Zufällig
              </button>
              {allCats.map(cat => {
                const active = !isRandom && selectedCategories.includes(cat);
                const isNew = NEW_CATEGORIES.has(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      if (isRandom) {
                        setSelectedCategories([cat]);
                      } else {
                        toggleCategory(cat);
                      }
                    }}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-all relative ${
                      active
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-white border border-stone-200 text-stone-500 hover:border-rose-300'
                    }`}
                  >
                    {cat}
                    <span className="opacity-60 font-mono-game ml-1">{WORD_PACKS[cat].length}</span>
                    {isNew && (
                      <span className={`ml-1.5 text-[9px] font-mono-game uppercase tracking-wider font-bold px-1 py-0.5 rounded ${
                        active ? 'bg-white/25 text-white' : 'bg-rose-100 text-rose-500'
                      }`}>
                        Neu
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono-game text-stone-400">
              <span>{unplayedCount} / {poolSize} unbenutzt</span>
              {unplayedCount < poolSize && (
                <button onClick={onResetHistory} className="hover:text-rose-500 transition-colors">
                  ↻ Historie zurücksetzen
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Anzahl Blender */}
      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-500 mb-2">Anzahl Blender</div>
        <div className={`grid gap-2 ${imposterOptions.length <= 4 ? `grid-cols-${imposterOptions.length}` : 'grid-cols-4'}`}>
          {imposterOptions.map(n => (
            <button key={n} onClick={() => setImposterCount(n)}
              className={`py-2.5 font-mono-game text-xs transition-all ${imposterCount === n ? btnActive : btnInactive}`}>
              {n}
            </button>
          ))}
        </div>
        {maxImposters === 1 && (
          <div className="mt-1.5 text-[10px] font-mono-game text-stone-400">
            Ab 6 Spielern sind mehrere Blender möglich.
          </div>
        )}
      </section>

      {/* Was sieht der Blender */}
      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-500 mb-2">Was sieht der Blender?</div>
        <div className="grid grid-cols-2 gap-2">
          {([['blank', 'Nichts', 'Pures Bluffen'], ['similar', 'Assoziation', 'Subtiler Hinweis']] as const).map(([id, label, sub]) => (
            <button key={id} onClick={() => setImposterMode(id)}
              className={`py-3 px-2 transition-all ${imposterMode === id ? btnActive : btnInactive}`}>
              <div className="font-mono-game text-xs uppercase tracking-wider">{label}</div>
              <div className="text-[10px] opacity-70 mt-1">{sub}</div>
            </button>
          ))}
        </div>
        {imposterMode === 'similar' && playerCount <= 3 && (
          <div className="mt-1.5 text-[10px] font-mono-game text-amber-600">
            ⚠ Bei 3 Spielern ist der Assoziations-Hinweis sehr stark.
          </div>
        )}
      </section>

      {/* Diskussionszeit */}
      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-500 mb-2">Diskussionszeit</div>
        <div className="grid grid-cols-4 gap-2">
          {[2, 3, 5, 7].map(m => (
            <button key={m} onClick={() => setDiscussionMinutes(m)}
              className={`py-2.5 font-mono-game text-xs transition-all ${discussionMinutes === m ? btnActive : btnInactive}`}>
              {m} min
            </button>
          ))}
        </div>
      </section>

      {/* Sound */}
      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-500 mb-2">Sound</div>
        <button
          onClick={onToggleSound}
          className={`px-4 py-2 font-mono-game text-xs uppercase tracking-wider transition-all ${soundEnabled ? btnActive : btnInactive}`}
        >
          {soundEnabled ? '♪ An' : '♪ Aus'}
        </button>
      </section>

    </div>
  );
}
