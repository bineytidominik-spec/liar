'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WORD_PACKS, getAllWordsFromCategories, type WordEntry, type Category } from './wordpacks';

// ============================================================================
// UTILITIES
// ============================================================================
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const PHASE = {
  SETUP: 'setup',
  PLAYERS: 'players',
  CONFIG: 'config',
  HANDOFF: 'handoff',
  REVEAL: 'reveal',
  DISCUSSION: 'discussion',
  VOTE: 'vote',
  RESULT: 'result',
  SCOREBOARD: 'scoreboard',
} as const;

type Phase = typeof PHASE[keyof typeof PHASE];

type CurrentWord = {
  word: string;
  association: string;
};

type Scores = Record<string, number>;
type Votes = Record<string, string>;

// ============================================================================
export default function HochstaplerApp() {
  const [phase, setPhase] = useState<Phase>(PHASE.SETUP);
  const [players, setPlayers] = useState<string[]>([]);
  const [scores, setScores] = useState<Scores>({});
  const [roundNumber, setRoundNumber] = useState(1);

  const [wordSource, setWordSource] = useState<'categories' | 'custom'>('categories');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(Object.keys(WORD_PACKS));
  const [customWords, setCustomWords] = useState<{ word: string; associations: string[] }[]>([]);
  const [imposterMode, setImposterMode] = useState<'blank' | 'similar'>('blank');
  const [discussionMinutes, setDiscussionMinutes] = useState(3);

  const [playedWords, setPlayedWords] = useState<Set<string>>(new Set());

  const [playOrder, setPlayOrder] = useState<number[]>([]);
  const [currentWord, setCurrentWord] = useState<CurrentWord | null>(null);
  const [imposterName, setImposterName] = useState<string | null>(null);
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [votes, setVotes] = useState<Votes>({});
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);
  const [imposterGuess, setImposterGuess] = useState('');

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timerRunning, timeLeft]);

  const startNewGame = () => {
    setPlayers([]);
    setScores({});
    setRoundNumber(1);
    setPlayedWords(new Set());
    setPhase(PHASE.PLAYERS);
  };

  const addPlayer = (name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed || players.includes(trimmed) || players.length >= 15) return false;
    setPlayers(p => [...p, trimmed]);
    setScores(s => ({ ...s, [trimmed]: 0 }));
    return true;
  };

  const removePlayer = (name: string) => {
    setPlayers(p => p.filter(x => x !== name));
    setScores(s => { const n = { ...s }; delete n[name]; return n; });
  };

  const goToConfig = () => {
    if (players.length < 3) return;
    setPhase(PHASE.CONFIG);
  };

  const pickWordAntiRepeat = (pool: WordEntry[]): WordEntry => {
    const unplayed = pool.filter(entry => !playedWords.has(entry.word));
    if (unplayed.length === 0) {
      setPlayedWords(new Set());
      return pickRandom(pool);
    }
    return pickRandom(unplayed);
  };

  const startRound = () => {
    let entry: WordEntry | null = null;

    if (wordSource === 'categories') {
      const pool = getAllWordsFromCategories(selectedCategories);
      if (pool.length === 0) return;
      entry = pickWordAntiRepeat(pool);
    } else if (wordSource === 'custom') {
      if (customWords.length === 0) return;
      const pool = customWords.map(c => ({ word: c.word, associations: c.associations, category: 'custom' }));
      entry = pickWordAntiRepeat(pool);
    }

    if (!entry) return;

    setPlayedWords(prev => new Set([...prev, entry!.word]));
    const association = pickRandom(entry.associations);
    setCurrentWord({ word: entry.word, association });

    const order = shuffle(players.map((_, i) => i));
    setPlayOrder(order);
    const imposterIdx = Math.floor(Math.random() * players.length);
    setImposterName(players[imposterIdx]);

    setCurrentTurnIdx(0);
    setCardFlipped(false);
    setVotes({});
    setCurrentVoterIdx(0);
    setImposterGuess('');
    setPhase(PHASE.HANDOFF);
  };

  const currentPlayer = () => players[playOrder[currentTurnIdx]];

  const proceedFromHandoff = () => {
    setCardFlipped(false);
    setPhase(PHASE.REVEAL);
  };

  const flipCard = () => setCardFlipped(true);

  const flipCardBack = () => {
    setCardFlipped(false);
    setTimeout(() => {
      if (currentTurnIdx + 1 >= players.length) {
        setTimeLeft(discussionMinutes * 60);
        setTimerRunning(false);
        setPhase(PHASE.DISCUSSION);
      } else {
        setCurrentTurnIdx(i => i + 1);
        setPhase(PHASE.HANDOFF);
      }
    }, 700);
  };

  const startVoting = () => {
    setTimerRunning(false);
    setCurrentVoterIdx(0);
    setVotes({});
    setPhase(PHASE.VOTE);
  };

  const submitVote = (votedFor: string) => {
    const voter = players[currentVoterIdx];
    const nextVotes = { ...votes, [voter]: votedFor };
    setVotes(nextVotes);
    if (currentVoterIdx + 1 >= players.length) {
      setPhase(PHASE.RESULT);
    } else {
      setCurrentVoterIdx(i => i + 1);
    }
  };

  const computeResult = () => {
    const voteCounts: Record<string, number> = {};
    players.forEach(p => { voteCounts[p] = 0; });
    Object.values(votes).forEach(target => {
      voteCounts[target] = (voteCounts[target] || 0) + 1;
    });
    const maxVotes = Math.max(...Object.values(voteCounts));
    const topVoted = players.filter(p => voteCounts[p] === maxVotes);
    const imposterCaught = topVoted.length === 1 && topVoted[0] === imposterName;
    return { imposterName, voteCounts, imposterCaught, topVoted };
  };

  const applyScoring = () => {
    const { imposterCaught } = computeResult();
    const nextScores = { ...scores };

    if (imposterCaught) {
      players.forEach(p => {
        if (p !== imposterName) nextScores[p] = (nextScores[p] || 0) + 1;
      });
      if (imposterGuess && imposterGuess.trim().toLowerCase() === currentWord?.word.toLowerCase()) {
        nextScores[imposterName!] = (nextScores[imposterName!] || 0) + 1;
      }
    } else {
      nextScores[imposterName!] = (nextScores[imposterName!] || 0) + 2;
      if (imposterGuess && imposterGuess.trim().toLowerCase() === currentWord?.word.toLowerCase()) {
        nextScores[imposterName!] = (nextScores[imposterName!] || 0) + 1;
      }
    }

    setScores(nextScores);
    setRoundNumber(r => r + 1);
    setPhase(PHASE.SCOREBOARD);
  };

  const poolSize = useMemo(() => {
    if (wordSource === 'categories') return getAllWordsFromCategories(selectedCategories).length;
    return customWords.length;
  }, [wordSource, selectedCategories, customWords]);

  const unplayedCount = poolSize - playedWords.size;

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-stone-100 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(234,179,8,0.04),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }} />
      </div>

      <style>{`
        .font-display { font-family: var(--font-fraunces), serif; font-variation-settings: 'SOFT' 50, 'WONK' 1; }
        .font-mono-game { font-family: var(--font-jetbrains-mono), monospace; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-soft { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        .fade-up { animation: fadeUp 0.5s ease-out both; }
        .pulse-soft { animation: pulse-soft 2s ease-in-out infinite; }
        .card-3d { perspective: 1000px; }
        .card-inner {
          position: relative; width: 100%; height: 100%;
          transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1);
          transform-style: preserve-3d;
        }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-face {
          position: absolute; inset: 0;
          backface-visibility: hidden; -webkit-backface-visibility: hidden;
        }
        .card-back { transform: rotateY(180deg); }
      `}</style>

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-8 min-h-screen flex flex-col">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-500">Ein Partyspiel</div>
            <h1 className="font-display text-3xl font-black italic tracking-tight leading-none mt-1">
              Hoch<span className="text-red-500">stapler</span>
            </h1>
          </div>
          {phase !== PHASE.SETUP && (
            <div className="text-right font-mono-game text-[10px] uppercase tracking-widest text-stone-500">
              <div>Runde {roundNumber}</div>
              <div>{players.length} Spieler</div>
            </div>
          )}
        </header>

        <main className="flex-1 flex flex-col">
          {phase === PHASE.SETUP && <SetupScreen onStart={startNewGame} />}
          {phase === PHASE.PLAYERS && <PlayersScreen players={players} addPlayer={addPlayer} removePlayer={removePlayer} onContinue={goToConfig} />}
          {phase === PHASE.CONFIG && <ConfigScreen
            wordSource={wordSource} setWordSource={setWordSource}
            selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories}
            customWords={customWords} setCustomWords={setCustomWords}
            imposterMode={imposterMode} setImposterMode={setImposterMode}
            discussionMinutes={discussionMinutes} setDiscussionMinutes={setDiscussionMinutes}
            poolSize={poolSize} unplayedCount={unplayedCount}
            onResetHistory={() => setPlayedWords(new Set())}
            onBack={() => setPhase(PHASE.PLAYERS)}
            onStart={startRound}
          />}
          {phase === PHASE.HANDOFF && <HandoffScreen playerName={currentPlayer()} turnIdx={currentTurnIdx} total={players.length} onContinue={proceedFromHandoff} />}
          {phase === PHASE.REVEAL && currentWord && <RevealScreen
            playerName={currentPlayer()}
            isImposter={currentPlayer() === imposterName}
            word={currentWord}
            imposterMode={imposterMode}
            flipped={cardFlipped}
            onFlip={flipCard}
            onFlipBack={flipCardBack}
            turnIdx={currentTurnIdx}
            total={players.length}
          />}
          {phase === PHASE.DISCUSSION && <DiscussionScreen
            timeLeft={timeLeft}
            running={timerRunning}
            onToggle={() => setTimerRunning(r => !r)}
            onReset={() => { setTimeLeft(discussionMinutes * 60); setTimerRunning(false); }}
            onVote={startVoting}
          />}
          {phase === PHASE.VOTE && <VoteScreen voter={players[currentVoterIdx]} candidates={players} onVote={submitVote} idx={currentVoterIdx} total={players.length} />}
          {phase === PHASE.RESULT && currentWord && <ResultScreen
            result={computeResult()}
            word={currentWord}
            imposterMode={imposterMode}
            imposterGuess={imposterGuess}
            setImposterGuess={setImposterGuess}
            onContinue={applyScoring}
          />}
          {phase === PHASE.SCOREBOARD && <ScoreboardScreen scores={scores} players={players} onNextRound={() => setPhase(PHASE.CONFIG)} onEnd={() => setPhase(PHASE.SETUP)} />}
        </main>
      </div>
    </div>
  );
}

// ============================================================================
function SetupScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center fade-up">
      <div className="max-w-md">
        <div className="font-mono-game text-xs uppercase tracking-[0.4em] text-red-500/80 mb-6">— Wer lügt? —</div>
        <p className="font-display text-xl italic text-stone-300 leading-relaxed mb-12">
          Alle kennen das Wort.<br />
          Einer tut so, als ob.<br />
          <span className="text-red-500 not-italic font-black">Findet ihn.</span>
        </p>
        <button
          onClick={onStart}
          className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-mono-game text-sm uppercase tracking-[0.2em] transition-all active:scale-95"
          style={{ clipPath: 'polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}
        >
          Spiel starten
        </button>
        <div className="mt-16 font-mono-game text-[10px] uppercase tracking-widest text-stone-600 space-y-1">
          <div>3–15 Spieler · Pass &amp; Play</div>
          <div>Ein Handy reicht</div>
        </div>
      </div>
    </div>
  );
}

function PlayersScreen({ players, addPlayer, removePlayer, onContinue }: {
  players: string[];
  addPlayer: (name: string) => boolean;
  removePlayer: (name: string) => void;
  onContinue: () => void;
}) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (addPlayer(name)) {
      setName('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fade-up">
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Phase 01</div>
      <h2 className="font-display text-2xl font-bold mb-1">Wer spielt mit?</h2>
      <p className="text-stone-400 text-sm mb-6">Mindestens 3, maximal 15 Spieler.</p>

      <div className="flex gap-2 mb-6">
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Name eingeben..."
          maxLength={20}
          className="flex-1 bg-stone-900/60 border border-stone-800 px-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!name.trim() || players.length >= 15}
          className="px-5 bg-stone-100 text-stone-900 font-mono-game text-xs uppercase tracking-wider hover:bg-red-500 hover:text-white disabled:opacity-30 disabled:hover:bg-stone-100 disabled:hover:text-stone-900 transition-colors"
        >
          + Hinzu
        </button>
      </div>

      <div className="space-y-1.5 mb-8 max-h-[50vh] overflow-y-auto">
        {players.length === 0 && (
          <div className="text-stone-600 text-sm italic text-center py-8">Noch keine Spieler. Legt los.</div>
        )}
        {players.map((p, i) => (
          <div key={p} className="group flex items-center justify-between bg-stone-900/40 border-l-2 border-red-500/40 px-4 py-2.5 fade-up" style={{ animationDelay: `${i * 30}ms` }}>
            <div className="flex items-center gap-3">
              <span className="font-mono-game text-xs text-stone-500">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-lg">{p}</span>
            </div>
            <button
              onClick={() => removePlayer(p)}
              className="opacity-40 hover:opacity-100 text-stone-400 hover:text-red-500 transition-all text-xs"
            >
              Entfernen
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        disabled={players.length < 3}
        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-mono-game text-sm uppercase tracking-[0.2em] disabled:bg-stone-800 disabled:text-stone-600 transition-colors"
      >
        Weiter zur Runde →
      </button>
    </div>
  );
}

function ConfigScreen({
  wordSource, setWordSource, selectedCategories, setSelectedCategories,
  customWords, setCustomWords, imposterMode, setImposterMode,
  discussionMinutes, setDiscussionMinutes,
  poolSize, unplayedCount, onResetHistory,
  onBack, onStart
}: {
  wordSource: 'categories' | 'custom';
  setWordSource: (v: 'categories' | 'custom') => void;
  selectedCategories: Category[];
  setSelectedCategories: (v: Category[]) => void;
  customWords: { word: string; associations: string[] }[];
  setCustomWords: (v: { word: string; associations: string[] }[]) => void;
  imposterMode: 'blank' | 'similar';
  setImposterMode: (v: 'blank' | 'similar') => void;
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
    setSelectedCategories(selectedCategories.includes(cat) ? selectedCategories.filter(c => c !== cat) : [...selectedCategories, cat]);
  };

  const addCustom = () => {
    if (!customWord.trim()) return;
    const associations = customAssocs.split(',').map(s => s.trim()).filter(Boolean);
    if (associations.length === 0) return;
    setCustomWords([...customWords, { word: customWord.trim(), associations }]);
    setCustomWord('');
    setCustomAssocs('');
  };

  const canStart = () => {
    if (wordSource === 'categories') return selectedCategories.length > 0;
    if (wordSource === 'custom') return customWords.length > 0;
    return false;
  };

  return (
    <div className="fade-up space-y-6 pb-4">
      <div>
        <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Phase 02</div>
        <h2 className="font-display text-2xl font-bold mb-1">Spielregeln</h2>
      </div>

      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-400 mb-2">Wortquelle</div>
        <div className="grid grid-cols-2 gap-1">
          {[{ id: 'categories' as const, label: 'Kategorien' }, { id: 'custom' as const, label: 'Eigene' }].map(opt => (
            <button
              key={opt.id}
              onClick={() => setWordSource(opt.id)}
              className={`py-3 font-mono-game text-xs uppercase tracking-wider transition-all ${
                wordSource === opt.id ? 'bg-red-600 text-white' : 'bg-stone-900/60 border border-stone-800 text-stone-400 hover:border-red-500/50'
              }`}
            >
              {opt.label}
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
              const count = WORD_PACKS[cat].length;
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 text-xs transition-all ${
                    active ? 'bg-stone-100 text-stone-900' : 'bg-transparent border border-stone-700 text-stone-400 hover:border-stone-500'
                  }`}
                >
                  {cat} <span className="opacity-60 font-mono-game ml-1">{count}</span>
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
          <input
            value={customWord}
            onChange={e => setCustomWord(e.target.value)}
            placeholder="Hauptwort"
            className="w-full bg-stone-900/60 border border-stone-800 px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 mb-2"
          />
          <input
            value={customAssocs}
            onChange={e => setCustomAssocs(e.target.value)}
            placeholder="Assoziationen, kommagetrennt"
            className="w-full bg-stone-900/60 border border-stone-800 px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 mb-2"
          />
          <button
            onClick={addCustom}
            disabled={!customWord.trim() || !customAssocs.trim()}
            className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-xs font-mono-game uppercase tracking-wider disabled:opacity-40"
          >
            + Wort hinzufügen
          </button>
          {customWords.length > 0 && (
            <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
              {customWords.map((w, i) => (
                <div key={i} className="flex justify-between text-xs bg-stone-900/40 px-3 py-2">
                  <span>
                    <span className="text-stone-100 font-semibold">{w.word}</span>
                    <span className="text-stone-600 ml-2">→ {w.associations.join(', ')}</span>
                  </span>
                  <button onClick={() => setCustomWords(customWords.filter((_, j) => j !== i))} className="text-stone-500 hover:text-red-500">×</button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-400 mb-2">Was sieht der Hochstapler?</div>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setImposterMode('blank')}
            className={`py-3 px-2 transition-all ${imposterMode === 'blank' ? 'bg-red-600 text-white' : 'bg-stone-900/60 border border-stone-800 text-stone-400'}`}
          >
            <div className="font-mono-game text-xs uppercase tracking-wider">Nichts</div>
            <div className="text-[10px] opacity-70 mt-1">Pures Bluffen</div>
          </button>
          <button
            onClick={() => setImposterMode('similar')}
            className={`py-3 px-2 transition-all ${imposterMode === 'similar' ? 'bg-red-600 text-white' : 'bg-stone-900/60 border border-stone-800 text-stone-400'}`}
          >
            <div className="font-mono-game text-xs uppercase tracking-wider">Assoziation</div>
            <div className="text-[10px] opacity-70 mt-1">Subtiler Hinweis</div>
          </button>
        </div>
      </section>

      <section>
        <div className="font-mono-game text-xs uppercase tracking-wider text-stone-400 mb-2">Diskussionszeit</div>
        <div className="grid grid-cols-4 gap-1">
          {[2, 3, 5, 7].map(m => (
            <button
              key={m}
              onClick={() => setDiscussionMinutes(m)}
              className={`py-2.5 font-mono-game text-xs transition-all ${
                discussionMinutes === m ? 'bg-stone-100 text-stone-900' : 'bg-stone-900/60 border border-stone-800 text-stone-400'
              }`}
            >
              {m} min
            </button>
          ))}
        </div>
      </section>

      <div className="flex gap-2 pt-4">
        <button onClick={onBack} className="px-5 py-3 bg-stone-900 text-stone-400 font-mono-game text-xs uppercase tracking-wider hover:bg-stone-800">← Spieler</button>
        <button
          onClick={onStart}
          disabled={!canStart()}
          className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-mono-game text-sm uppercase tracking-[0.2em] disabled:bg-stone-800 disabled:text-stone-600 transition-colors"
        >
          Runde starten →
        </button>
      </div>
    </div>
  );
}

function HandoffScreen({ playerName, turnIdx, total, onContinue }: {
  playerName: string;
  turnIdx: number;
  total: number;
  onContinue: () => void;
}) {
  return (
    <div className="fade-up flex-1 flex flex-col items-center justify-center text-center">
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-4">
        {turnIdx + 1} von {total}
      </div>
      <div className="font-mono-game text-xs uppercase tracking-widest text-stone-400 mb-3">Das Handy geht an</div>
      <h2 className="font-display text-5xl font-black italic text-red-500 mb-2 break-words max-w-full px-4">
        {playerName}
      </h2>
      <div className="text-stone-500 text-sm italic mb-12">Bereit? Tippe, um die Karte zu sehen.</div>

      <button
        onClick={onContinue}
        className="px-10 py-4 bg-stone-100 text-stone-900 font-mono-game text-sm uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-colors active:scale-95"
      >
        Ich bin&apos;s →
      </button>
    </div>
  );
}

function RevealScreen({ playerName, isImposter, word, imposterMode, flipped, onFlip, onFlipBack, turnIdx, total }: {
  playerName: string;
  isImposter: boolean;
  word: CurrentWord;
  imposterMode: 'blank' | 'similar';
  flipped: boolean;
  onFlip: () => void;
  onFlipBack: () => void;
  turnIdx: number;
  total: number;
}) {
  const backContent = () => {
    if (isImposter) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <div className="font-mono-game text-[10px] uppercase tracking-[0.4em] text-red-500 mb-6">Deine Rolle</div>
          <div className="font-display text-5xl sm:text-6xl font-black italic text-red-500 mb-6">HOCHSTAPLER</div>
          {imposterMode === 'similar' ? (
            <>
              <div className="font-mono-game text-[10px] uppercase tracking-widest text-stone-500 mb-2">Dein Hinweis</div>
              <div className="font-display text-2xl sm:text-3xl italic text-stone-100 mb-6">{word.association}</div>
              <div className="text-stone-400 text-xs italic px-4">
                Passt irgendwie. Bluff dich durch.
              </div>
            </>
          ) : (
            <div className="text-stone-400 text-sm italic max-w-xs">
              Du kennst das Wort nicht.<br />
              Hör zu und bluff dich durch.
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="font-mono-game text-[10px] uppercase tracking-[0.4em] text-stone-500 mb-6">Dein Wort</div>
        <div className="font-display text-4xl sm:text-5xl font-black italic text-stone-100 break-words">{word.word}</div>
        <div className="mt-8 text-stone-500 text-xs italic">
          Einer am Tisch kennt dieses Wort nicht.
        </div>
      </div>
    );
  };

  return (
    <div className="fade-up flex-1 flex flex-col">
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">
        {turnIdx + 1} von {total} · <span className="text-stone-300">{playerName}</span>
      </div>

      <div className="flex-1 flex items-center justify-center py-4">
        <div className="card-3d w-full max-w-sm aspect-[3/4]">
          <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
            <button
              onClick={!flipped ? onFlip : undefined}
              className="card-face w-full h-full bg-gradient-to-br from-stone-900 to-stone-950 border border-red-500/20 hover:border-red-500/60 transition-colors group overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.12),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-full flex flex-col items-center justify-center">
                <div className="font-mono-game text-[10px] uppercase tracking-[0.4em] text-stone-500 mb-6">Tippen zum Aufdecken</div>
                <div className="font-display text-7xl font-black text-red-500/70 italic">?</div>
                <div className="font-mono-game text-[10px] uppercase tracking-widest text-stone-600 mt-6 px-4 text-center">
                  nur {playerName} darf schauen
                </div>
              </div>
            </button>

            <button
              onClick={flipped ? onFlipBack : undefined}
              className={`card-face card-back w-full h-full border cursor-pointer ${
                isImposter ? 'bg-gradient-to-br from-red-950/40 to-stone-950 border-red-500/40' : 'bg-gradient-to-br from-stone-800 to-stone-950 border-stone-700'
              }`}
            >
              <div className="relative h-full">
                {backContent()}
                <div className="absolute bottom-4 left-0 right-0 font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-500 text-center pulse-soft">
                  Tippen zum Verdecken
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiscussionScreen({ timeLeft, running, onToggle, onReset, onVote }: {
  timeLeft: number;
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
  onVote: () => void;
}) {
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isOver = timeLeft === 0 && !running;

  return (
    <div className="fade-up flex-1 flex flex-col">
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Phase 03</div>
      <h2 className="font-display text-2xl font-bold mb-8">Diskussion.</h2>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className={`font-display text-8xl font-black italic tabular-nums mb-4 ${isOver ? 'text-red-500 pulse-soft' : 'text-stone-100'}`}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        <div className="font-mono-game text-xs uppercase tracking-[0.3em] text-stone-500 mb-10">
          {isOver ? 'Zeit abgelaufen' : running ? 'Läuft…' : 'Pausiert'}
        </div>

        <div className="flex gap-2 mb-10">
          <button onClick={onToggle} className="px-6 py-3 bg-stone-100 text-stone-900 font-mono-game text-xs uppercase tracking-wider hover:bg-red-500 hover:text-white transition-colors">
            {running ? '❚❚ Pause' : '▶ Start'}
          </button>
          <button onClick={onReset} className="px-6 py-3 bg-stone-900 border border-stone-800 text-stone-400 font-mono-game text-xs uppercase tracking-wider hover:text-stone-100">
            ↻ Reset
          </button>
        </div>

        <div className="text-stone-500 text-sm italic text-center max-w-xs mb-8">
          Reihum eine Beschreibung des Worts.<br />
          Zu konkret — und du verrätst dich.<br />
          Zu vage — und du machst dich verdächtig.
        </div>
      </div>

      <button onClick={onVote} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-mono-game text-sm uppercase tracking-[0.2em] transition-colors">
        Zur Abstimmung →
      </button>
    </div>
  );
}

function VoteScreen({ voter, candidates, onVote, idx, total }: {
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

type ResultData = {
  imposterName: string | null;
  voteCounts: Record<string, number>;
  imposterCaught: boolean;
  topVoted: string[];
};

function ResultScreen({ result, word, imposterMode, imposterGuess, setImposterGuess, onContinue }: {
  result: ResultData;
  word: CurrentWord;
  imposterMode: 'blank' | 'similar';
  imposterGuess: string;
  setImposterGuess: (v: string) => void;
  onContinue: () => void;
}) {
  const { imposterName, voteCounts, imposterCaught, topVoted } = result;
  const [guessSubmitted, setGuessSubmitted] = useState(false);
  const needsGuess = !imposterCaught;
  const canContinue = !needsGuess || guessSubmitted;
  const maxVotes = Math.max(1, ...Object.values(voteCounts));

  return (
    <div className="fade-up flex-1 flex flex-col">
      <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-500 mb-2">Auflösung</div>

      <div className={`border-l-4 ${imposterCaught ? 'border-green-500' : 'border-red-500'} pl-4 mb-6`}>
        <div className={`font-mono-game text-xs uppercase tracking-widest mb-1 ${imposterCaught ? 'text-green-500' : 'text-red-500'}`}>
          {imposterCaught ? 'Crew gewinnt' : 'Hochstapler gewinnt'}
        </div>
        <div className="font-display text-3xl font-black italic">
          {imposterCaught ? 'Entlarvt.' : topVoted.length > 1 ? 'Keine Mehrheit.' : 'Unentdeckt.'}
        </div>
      </div>

      <div className="bg-stone-900/40 p-5 mb-6 space-y-3">
        <div>
          <div className="font-mono-game text-[10px] uppercase tracking-widest text-stone-500 mb-1">Der Hochstapler war</div>
          <div className="font-display text-2xl font-bold text-red-500">{imposterName}</div>
        </div>
        <div>
          <div className="font-mono-game text-[10px] uppercase tracking-widest text-stone-500 mb-1">Das Wort</div>
          <div className="font-display text-2xl font-bold italic">{word.word}</div>
          {imposterMode === 'similar' && (
            <div className="text-xs text-stone-500 mt-1">Hinweis für Imposter: <span className="text-stone-300">{word.association}</span></div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="font-mono-game text-[10px] uppercase tracking-widest text-stone-500 mb-2">Stimmen</div>
        <div className="space-y-1">
          {Object.entries(voteCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
            <div key={name} className="flex items-center gap-3">
              <div className="w-28 text-sm truncate">{name}{name === imposterName && <span className="text-red-500 ml-1">●</span>}</div>
              <div className="flex-1 bg-stone-900 h-2">
                <div className="bg-red-500 h-full transition-all" style={{ width: `${(count / maxVotes) * 100}%` }} />
              </div>
              <div className="font-mono-game text-xs text-stone-400 w-6 text-right">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {needsGuess && !guessSubmitted && (
        <div className="bg-red-950/30 border border-red-500/30 p-4 mb-6 fade-up">
          <div className="font-mono-game text-[10px] uppercase tracking-widest text-red-500 mb-2">Bonus-Chance</div>
          <p className="text-sm text-stone-300 mb-3">
            <span className="font-bold">{imposterName}</span>, errätst du das Wort? (+1 Bonuspunkt)
          </p>
          <div className="flex gap-2">
            <input
              value={imposterGuess}
              onChange={e => setImposterGuess(e.target.value)}
              placeholder="Dein Tipp..."
              className="flex-1 bg-stone-900 border border-stone-800 px-3 py-2 text-sm focus:outline-none focus:border-red-500"
            />
            <button
              onClick={() => setGuessSubmitted(true)}
              className="px-4 bg-red-600 text-white text-xs font-mono-game uppercase tracking-wider"
            >
              Abgeben
            </button>
          </div>
          <button onClick={() => { setImposterGuess(''); setGuessSubmitted(true); }} className="text-xs text-stone-500 mt-2 hover:text-stone-300">
            Überspringen
          </button>
        </div>
      )}

      <button
        onClick={onContinue}
        disabled={!canContinue}
        className="w-full py-4 bg-stone-100 text-stone-900 hover:bg-red-500 hover:text-white font-mono-game text-sm uppercase tracking-[0.2em] disabled:opacity-40 transition-colors"
      >
        Punkte vergeben →
      </button>
    </div>
  );
}

function ScoreboardScreen({ scores, players, onNextRound, onEnd }: {
  scores: Scores;
  players: string[];
  onNextRound: () => void;
  onEnd: () => void;
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
                <span className={`font-display text-2xl font-black italic ${i === 0 ? 'text-red-500' : 'text-stone-300'}`}>
                  {score}
                </span>
              </div>
              <div className="bg-stone-900 h-1">
                <div className={`h-full ${i === 0 ? 'bg-red-500' : 'bg-stone-600'}`} style={{ width: `${(score / maxScore) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button onClick={onEnd} className="px-5 py-3 bg-stone-900 text-stone-400 font-mono-game text-xs uppercase tracking-wider hover:bg-stone-800">
          Spiel beenden
        </button>
        <button onClick={onNextRound} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-mono-game text-sm uppercase tracking-[0.2em]">
          Nächste Runde →
        </button>
      </div>
    </div>
  );
}
