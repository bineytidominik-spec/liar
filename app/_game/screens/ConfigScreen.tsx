'use client';

import { useState } from 'react';
import { WORD_PACKS, NEW_CATEGORIES } from '../wordpacks';
import type { Category } from '../wordpacks';
import type { ImposterMode, WordSource, CustomWord } from '../types';

export function ConfigScreen({
  wordSource, setWordSource, selectedCategories, setSelectedCategories,
  customWords, setCustomWords, imposterMode, setImposterMode,
  imposterCount, setImposterCount,
  discussionMinutes, setDiscussionMinutes,
  poolSize, unplayedCount, onResetHistory, onBack, onStart,
  soundEnabled, onToggleSound, playerCount,
}: {
  soundEnabled: boolean;
  onToggleSound: () => void;
  playerCount: number;
  wordSource: WordSource;
  setWordSource: (v: WordSource) => void;
  selectedCategories: Category[];
  setSelectedCategories: (v: Category[]) => void;
  customWords: CustomWord[];
  setCustomWords: (v: CustomWord[]) => void;
  imposterMode: ImposterMode;
  setImposterMode: (v: ImposterMode) => void;
  imposterCount: number;
  setImposterCount: (v: number) => void;
  discussionMinutes: number;
  setDiscussionMinutes: (v: number) => void;
  poolSize: number;
  unplayedCount: number;
  onResetHistory: () => void;
  onBack: () => void;
  onStart: () => void;
}) {
  const [customWord, setCustomWord] = useState('');
  const [customAssocs, setCustomAssocs] = useState('');

  const maxImposters = Math.max(1, Math.floor(playerCount / 3));
  const imposterOptions = Array.from({ length: maxImposters }, (_, i) => i + 1);

  const toggleCategory = (cat: Category) => {
    setSelectedCategories(selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat]);
  };

  const addCustom = () => {
    if (!customWord.trim()) return;
    const associations = customAssocs.split(',').map(s => s.trim()).filter(Boolean);
    if (associations.length === 0) return;
    setCustomWords([...customWords, { word: customWord.trim(), associations }]);
    setCustomWord(''); setCustomAssocs('');
  };

  const canStart = wordSource === 'categories' ? selectedCategories.length > 0 : customWords.length > 0;

  const btnActive = 'bg-rose-500 text-white rounded-xl shadow-sm';
  const btnInactive = 'bg-white border border-stone-200 text-stone-500 hover:border-rose-300 rounded-xl';

  return (
    <div className="fade-up space-y-6 pb-4">
      <div>
        <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-rose-400 mb-2">Phase 02</div>
        <h2 className="font-display text-2xl font-bold mb-1 text-stone-800">Spielregeln</h2>
      </div>

      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-500 mb-2">Wortquelle</div>
        <div className="grid grid-cols-2 gap-2">
          {(['categories', 'custom'] as const).map(id => (
            <button key={id} onClick={() => setWordSource(id)}
              className={`py-3 font-mono-game text-xs uppercase tracking-wider transition-all ${wordSource === id ? btnActive : btnInactive}`}>
              {id === 'categories' ? 'Kategorien' : 'Eigene'}
            </button>
          ))}
        </div>
      </section>

      {wordSource === 'categories' && (
        <section className="fade-up">
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono-game text-xs uppercase tracking-wider text-stone-500">Themen wählen</div>
            <div className="font-mono-game text-[10px] text-stone-400">{unplayedCount} / {poolSize} frisch</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(WORD_PACKS).map(cat => {
              const active = selectedCategories.includes(cat);
              const isNew = NEW_CATEGORIES.has(cat);
              return (
                <button key={cat} onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 text-xs transition-all rounded-lg relative ${active ? 'bg-rose-500 text-white shadow-sm' : 'bg-white border border-stone-200 text-stone-500 hover:border-rose-300'}`}>
                  {cat} <span className="opacity-60 font-mono-game ml-1">{WORD_PACKS[cat].length}</span>
                  {isNew && (
                    <span className={`ml-1.5 text-[9px] font-mono-game uppercase tracking-wider font-bold px-1 py-0.5 rounded ${active ? 'bg-white/25 text-white' : 'bg-rose-100 text-rose-500'}`}>
                      Neu
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {unplayedCount < poolSize && (
            <button onClick={onResetHistory} className="mt-2 text-[10px] font-mono-game uppercase tracking-wider text-stone-400 hover:text-rose-500 transition-colors">
              ↻ Historie zurücksetzen
            </button>
          )}
        </section>
      )}

      {wordSource === 'custom' && (
        <section className="fade-up">
          <div className="font-mono-game text-xs uppercase tracking-wider text-stone-500 mb-2">Eigene Wörter</div>
          <input value={customWord} onChange={e => setCustomWord(e.target.value)} placeholder="Hauptwort"
            className="w-full bg-white border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 mb-2 text-stone-800 placeholder:text-stone-400 rounded-xl" />
          <input value={customAssocs} onChange={e => setCustomAssocs(e.target.value)} placeholder="Assoziationen, kommagetrennt"
            className="w-full bg-white border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400 mb-2 text-stone-800 placeholder:text-stone-400 rounded-xl" />
          <button onClick={addCustom} disabled={!customWord.trim() || !customAssocs.trim()}
            className="w-full py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-mono-game uppercase tracking-wider disabled:opacity-40 transition-colors rounded-xl">
            + Wort hinzufügen
          </button>
          {customWords.length > 0 && (
            <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
              {customWords.map((w, i) => (
                <div key={i} className="flex justify-between text-xs bg-white border border-stone-100 px-3 py-2 rounded-lg">
                  <span><span className="text-stone-800 font-semibold">{w.word}</span><span className="text-stone-400 ml-2">→ {w.associations.join(', ')}</span></span>
                  <button onClick={() => setCustomWords(customWords.filter((_, j) => j !== i))} className="text-stone-400 hover:text-rose-500">×</button>
                </div>
              ))}
            </div>
          )}
          {imposterMode === 'similar' && customWords.some(w => w.associations.length === 0) && (
            <div className="mt-2 text-[10px] font-mono-game text-amber-600">
              ⚠ Einige Wörter haben keine Assoziationen — im Assoziation-Modus wird nichts angezeigt.
            </div>
          )}
        </section>
      )}

      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-500 mb-2">Anzahl Liars</div>
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
            Ab 6 Spielern sind mehrere Liars möglich.
          </div>
        )}
      </section>

      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-500 mb-2">Was sieht der Liar?</div>
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

      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-500 mb-2">Sound</div>
        <button
          onClick={onToggleSound}
          className={`px-4 py-2 font-mono-game text-xs uppercase tracking-wider transition-all ${soundEnabled ? btnActive : btnInactive}`}
        >
          {soundEnabled ? '♪ An' : '♪ Aus'}
        </button>
      </section>

      <div className="sticky bottom-0 bg-[#fdf7f0] pt-3 flex gap-2" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <button onClick={onBack} className="px-5 py-3 bg-white border border-stone-200 text-stone-500 font-mono-game text-xs uppercase tracking-wider hover:bg-rose-50 hover:border-rose-200 rounded-xl shadow-sm transition-colors">
          ← Spieler
        </button>
        <button onClick={onStart} disabled={!canStart}
          className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-mono-game text-sm uppercase tracking-[0.2em] disabled:bg-stone-200 disabled:text-stone-400 transition-colors rounded-xl shadow-sm">
          Runde starten →
        </button>
      </div>
    </div>
  );
}
