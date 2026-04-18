'use client';

import { useState } from 'react';
import { WORD_PACKS } from '../wordpacks';
import type { Category } from '../wordpacks';
import type { ImposterMode, WordSource, CustomWord } from '../types';

export function ConfigScreen({
  wordSource, setWordSource, selectedCategories, setSelectedCategories,
  customWords, setCustomWords, imposterMode, setImposterMode,
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

  return (
    <div className="fade-up space-y-6 pb-4">
      <div>
        <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Phase 02</div>
        <h2 className="font-display text-2xl font-bold mb-1">Spielregeln</h2>
      </div>

      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-400 mb-2">Wortquelle</div>
        <div className="grid grid-cols-2 gap-1">
          {(['categories', 'custom'] as const).map(id => (
            <button key={id} onClick={() => setWordSource(id)}
              className={`py-3 font-mono-game text-xs uppercase tracking-wider transition-all ${wordSource === id ? 'bg-red-600 text-white' : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:border-red-500/50'}`}>
              {id === 'categories' ? 'Kategorien' : 'Eigene'}
            </button>
          ))}
        </div>
      </section>

      {wordSource === 'categories' && (
        <section className="fade-up">
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono-game text-xs uppercase tracking-wider text-stone-400">Themen wählen</div>
            <div className="font-mono-game text-[10px] text-stone-500">{unplayedCount} / {poolSize} frisch</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(WORD_PACKS).map(cat => {
              const active = selectedCategories.includes(cat);
              return (
                <button key={cat} onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 text-xs transition-all ${active ? 'bg-stone-100 text-stone-900' : 'bg-transparent border border-stone-700 text-stone-400 hover:border-stone-500'}`}>
                  {cat} <span className="opacity-60 font-mono-game ml-1">{WORD_PACKS[cat].length}</span>
                </button>
              );
            })}
          </div>
          {unplayedCount < poolSize && (
            <button onClick={onResetHistory} className="mt-2 text-[10px] font-mono-game uppercase tracking-wider text-stone-500 hover:text-red-500">
              ↻ Historie zurücksetzen
            </button>
          )}
        </section>
      )}

      {wordSource === 'custom' && (
        <section className="fade-up">
          <div className="font-mono-game text-xs uppercase tracking-wider text-stone-400 mb-2">Eigene Wörter</div>
          <input value={customWord} onChange={e => setCustomWord(e.target.value)} placeholder="Hauptwort"
            className="w-full bg-stone-900/60 border border-stone-800 px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 mb-2" />
          <input value={customAssocs} onChange={e => setCustomAssocs(e.target.value)} placeholder="Assoziationen, kommagetrennt"
            className="w-full bg-stone-900/60 border border-stone-800 px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 mb-2" />
          <button onClick={addCustom} disabled={!customWord.trim() || !customAssocs.trim()}
            className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-xs font-mono-game uppercase tracking-wider disabled:opacity-40">
            + Wort hinzufügen
          </button>
          {customWords.length > 0 && (
            <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
              {customWords.map((w, i) => (
                <div key={i} className="flex justify-between text-xs bg-stone-900/40 px-3 py-2">
                  <span><span className="text-stone-100 font-semibold">{w.word}</span><span className="text-stone-600 ml-2">→ {w.associations.join(', ')}</span></span>
                  <button onClick={() => setCustomWords(customWords.filter((_, j) => j !== i))} className="text-stone-500 hover:text-red-500">×</button>
                </div>
              ))}
            </div>
          )}
          {imposterMode === 'similar' && customWords.some(w => w.associations.length === 0) && (
            <div className="mt-2 text-[10px] font-mono-game text-yellow-500/80">
              ⚠ Einige Wörter haben keine Assoziationen — im Assoziation-Modus wird nichts angezeigt.
            </div>
          )}
        </section>
      )}

      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-400 mb-2">Was sieht der Hochstapler?</div>
        <div className="grid grid-cols-2 gap-1">
          {([['blank', 'Nichts', 'Pures Bluffen'], ['similar', 'Assoziation', 'Subtiler Hinweis']] as const).map(([id, label, sub]) => (
            <button key={id} onClick={() => setImposterMode(id)}
              className={`py-3 px-2 transition-all ${imposterMode === id ? 'bg-red-600 text-white' : 'bg-stone-900/60 border border-stone-800 text-stone-400'}`}>
              <div className="font-mono-game text-xs uppercase tracking-wider">{label}</div>
              <div className="text-[10px] opacity-70 mt-1">{sub}</div>
            </button>
          ))}
        </div>
        {imposterMode === 'similar' && playerCount <= 3 && (
          <div className="mt-2 text-[10px] font-mono-game text-yellow-500/80">
            ⚠ Bei 3 Spielern ist der Assoziations-Hinweis sehr stark.
          </div>
        )}
      </section>

      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-400 mb-2">Diskussionszeit</div>
        <div className="grid grid-cols-4 gap-1">
          {[2, 3, 5, 7].map(m => (
            <button key={m} onClick={() => setDiscussionMinutes(m)}
              className={`py-2.5 font-mono-game text-xs transition-all ${discussionMinutes === m ? 'bg-stone-100 text-stone-900' : 'bg-stone-900/60 border border-stone-800 text-stone-400'}`}>
              {m} min
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-400 mb-2">Sound</div>
        <button
          onClick={onToggleSound}
          className={`px-4 py-2 font-mono-game text-xs uppercase tracking-wider transition-all ${soundEnabled ? 'bg-stone-100 text-stone-900' : 'bg-stone-900/60 border border-stone-800 text-stone-400'}`}
        >
          {soundEnabled ? '♪ An' : '♪ Aus'}
        </button>
      </section>

      <div className="flex gap-2 pt-4">
        <button onClick={onBack} className="px-5 py-3 bg-stone-900 text-stone-400 font-mono-game text-xs uppercase tracking-wider hover:bg-stone-800">← Spieler</button>
        <button onClick={onStart} disabled={!canStart}
          className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-mono-game text-sm uppercase tracking-[0.2em] disabled:bg-stone-800 disabled:text-stone-600 transition-colors">
          Runde starten →
        </button>
      </div>
    </div>
  );
}
