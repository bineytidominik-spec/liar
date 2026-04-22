'use client';

import { useState, useMemo, useEffect } from 'react';
import { PHASE, type Phase, type ImposterMode, type WordSource, type CurrentWord, type CustomWord, type Scores, type Votes, type ResultData } from '../types';
import { WORD_PACKS, getAllWordsFromCategories, type Category } from '../wordpacks';
import { shuffle, pickRandom, pickWordAntiRepeat } from '../utils';
import { useTimer, type Timer } from './useTimer';
import { saveGame, loadGame, clearGame, isNativeApp, type PersistedState } from '../storage';
import { recordRound, resetStats } from '../stats';

export type GameState = {
  phase: Phase;
  players: string[];
  scores: Scores;
  roundNumber: number;
  wordSource: WordSource;
  selectedCategories: Category[];
  customWords: CustomWord[];
  imposterMode: ImposterMode;
  imposterCount: number;
  discussionMinutes: number;
  playedWords: Set<string>;
  playOrder: number[];
  currentWord: CurrentWord | null;
  imposterNames: string[];
  currentTurnIdx: number;
  cardFlipped: boolean;
  votes: Votes;
  currentVoterIdx: number;
  imposterGuess: string;
  poolSize: number;
  unplayedCount: number;
  savedGame: PersistedState | null;
  timer: Timer;
  currentPlayer: () => string;
  computeResult: () => ResultData;
  setWordSource: (v: WordSource) => void;
  setSelectedCategories: (v: Category[]) => void;
  setCustomWords: (v: CustomWord[]) => void;
  setImposterMode: (v: ImposterMode) => void;
  setImposterCount: (v: number) => void;
  setDiscussionMinutes: (v: number) => void;
  setImposterGuess: (v: string) => void;
  startNewGame: () => void;
  resumeGame: () => void;
  addPlayer: (name: string) => boolean;
  removePlayer: (name: string) => void;
  goToConfig: () => void;
  goToPlayers: () => void;
  goToSetup: () => void;
  startRound: () => void;
  proceedFromHandoff: () => void;
  flipCard: () => void;
  flipCardBack: () => void;
  startVoting: () => void;
  submitVote: (votedFor: string) => void;
  applyScoring: () => void;
  resetPlayedWords: () => void;
  resetScores: () => void;
};

export function useGameState(): GameState {
  const [phase, setPhase] = useState<Phase>(PHASE.SETUP);
  const [players, setPlayers] = useState<string[]>([]);
  const [scores, setScores] = useState<Scores>({});
  const [roundNumber, setRoundNumber] = useState(1);
  const [wordSource, setWordSource] = useState<WordSource>('categories');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(Object.keys(WORD_PACKS));
  const [customWords, setCustomWords] = useState<CustomWord[]>([]);
  const [imposterMode, setImposterMode] = useState<ImposterMode>('blank');
  const [imposterCount, setImposterCount] = useState(1);
  const [discussionMinutes, setDiscussionMinutes] = useState(3);
  const [playedWords, setPlayedWords] = useState<Set<string>>(new Set());
  const [playOrder, setPlayOrder] = useState<number[]>([]);
  const [currentWord, setCurrentWord] = useState<CurrentWord | null>(null);
  const [imposterNames, setImposterNames] = useState<string[]>([]);
  const [currentTurnIdx, setCurrentTurnIdx] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [votes, setVotes] = useState<Votes>({});
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);
  const [imposterGuess, setImposterGuess] = useState('');
  const [savedGame, setSavedGame] = useState<PersistedState | null>(null);

  const timer = useTimer();

  // Load saved game on mount (SSR-safe: only runs client-side)
  useEffect(() => {
    setSavedGame(loadGame());
  }, []);

  const poolSize = useMemo(() => {
    if (wordSource === 'categories') return getAllWordsFromCategories(selectedCategories).length;
    return customWords.length;
  }, [wordSource, selectedCategories, customWords]);

  const unplayedCount = poolSize - playedWords.size;
  const currentPlayer = () => players[playOrder[currentTurnIdx]];

  const computeResult = (): ResultData => {
    const voteCounts: Record<string, number> = {};
    players.forEach(p => { voteCounts[p] = 0; });
    Object.values(votes).forEach(target => {
      voteCounts[target] = (voteCounts[target] || 0) + 1;
    });
    const maxVotes = Math.max(...Object.values(voteCounts));
    const topVoted = players.filter(p => voteCounts[p] === maxVotes);
    const imposterCaught = topVoted.length === 1 && imposterNames.includes(topVoted[0]);
    return { imposterNames, voteCounts, imposterCaught, topVoted };
  };

  const applyPersistedState = (s: PersistedState) => {
    setPlayers(s.players);
    // iOS: gespeicherte Scores wiederherstellen; Web: immer bei 0 starten
    if (isNativeApp() && s.scores) setScores(s.scores);
    setRoundNumber(s.roundNumber);
    setWordSource(s.wordSource);
    setSelectedCategories(s.selectedCategories);
    setCustomWords(s.customWords);
    setImposterMode(s.imposterMode);
    setImposterCount(s.imposterCount ?? 1);
    setDiscussionMinutes(s.discussionMinutes);
    setPlayedWords(new Set(s.playedWords));
  };

  const startNewGame = () => {
    clearGame(); setSavedGame(null); resetStats();
    setPlayers([]); setScores({}); setRoundNumber(1);
    setPlayedWords(new Set()); setPhase(PHASE.PLAYERS);
  };

  const resumeGame = () => {
    if (!savedGame) return;
    applyPersistedState(savedGame);
    setPhase(PHASE.CONFIG);
  };

  const persistCurrentState = (
    nextPlayers: string[], nextScores: Scores, nextRound: number,
    nextPlayedWords: Set<string>
  ) => {
    const state: PersistedState = {
      version: 1, savedAt: Date.now(),
      players: nextPlayers, scores: nextScores, roundNumber: nextRound,
      wordSource, selectedCategories, customWords, imposterMode, imposterCount,
      discussionMinutes, playedWords: [...nextPlayedWords],
    };
    saveGame(state);
    setSavedGame(state);
  };

  const addPlayer = (name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed || players.includes(trimmed) || players.length >= 15) return false;
    setPlayers(p => [...p, trimmed]);
    setScores(s => ({ ...s, [trimmed]: 0 }));
    return true;
  };

  const removePlayer = (name: string) => {
    setPlayers(p => {
      const next = p.filter(x => x !== name);
      // Clamp imposterCount if needed after removal
      const maxI = Math.max(1, Math.floor(next.length / 3));
      setImposterCount(c => Math.min(c, maxI));
      return next;
    });
    setScores(s => { const n = { ...s }; delete n[name]; return n; });
  };

  const goToConfig = () => { if (players.length >= 3) setPhase(PHASE.CONFIG); };
  const goToPlayers = () => setPhase(PHASE.PLAYERS);
  const goToSetup = () => { clearGame(); setSavedGame(null); setPhase(PHASE.SETUP); };

  const startRound = () => {
    const pool = wordSource === 'categories'
      ? getAllWordsFromCategories(selectedCategories)
      : customWords.map(c => ({ ...c, category: 'custom' }));
    if (pool.length === 0) return;

    const entry = pickWordAntiRepeat(pool, playedWords, () => setPlayedWords(new Set()));
    const nextPlayedWords = new Set([...playedWords, entry.word]);
    setPlayedWords(nextPlayedWords);
    setCurrentWord({ word: entry.word, association: pickRandom(entry.associations) });

    // Pick N imposters first so we can use them when determining play order
    const maxI = Math.max(1, Math.floor(players.length / 3));
    const effectiveCount = Math.min(imposterCount, maxI);
    const shuffledPlayers = shuffle([...players]);
    const chosenImposters = shuffledPlayers.slice(0, effectiveCount);
    setImposterNames(chosenImposters);

    // Build play order: ~85% chance a non-imposter goes first
    const order = shuffle(players.map((_, i) => i));
    if (Math.random() > 0.15) {
      const firstIsImposter = chosenImposters.includes(players[order[0]]);
      if (firstIsImposter) {
        const swapIdx = order.findIndex(i => !chosenImposters.includes(players[i]));
        if (swapIdx !== -1) [order[0], order[swapIdx]] = [order[swapIdx], order[0]];
      }
    }
    setPlayOrder(order);

    setCurrentTurnIdx(0); setCardFlipped(false);
    setVotes({}); setCurrentVoterIdx(0); setImposterGuess('');
    setPhase(PHASE.REVEAL);
  };

  const proceedFromHandoff = () => { setCardFlipped(false); setPhase(PHASE.REVEAL); };
  const flipCard = () => setCardFlipped(true);

  const flipCardBack = () => {
    setCardFlipped(false);
    setTimeout(() => {
      if (currentTurnIdx + 1 >= players.length) {
        timer.reset(discussionMinutes * 60);
        setPhase(PHASE.DISCUSSION);
      } else {
        setCurrentTurnIdx(i => i + 1);
        setPhase(PHASE.REVEAL);
      }
    }, 700);
  };

  const startVoting = () => {
    timer.stop();
    setCurrentVoterIdx(0); setVotes({}); setPhase(PHASE.VOTE);
  };

  const submitVote = (votedFor: string) => {
    const voter = players[currentVoterIdx];
    const nextVotes = { ...votes, [voter]: votedFor };
    setVotes(nextVotes);
    if (currentVoterIdx + 1 >= players.length) setPhase(PHASE.RESULT);
    else setCurrentVoterIdx(i => i + 1);
  };

  const applyScoring = () => {
    const { imposterCaught, topVoted } = computeResult();
    const isTie = !imposterCaught && topVoted.length > 1;
    const next = { ...scores };
    const guessCorrect = imposterGuess &&
      imposterGuess.trim().toLowerCase() === currentWord?.word.toLowerCase();

    if (imposterCaught) {
      // Crew wins: non-imposters +1, imposters can get +1 for correct guess
      players.forEach(p => { if (!imposterNames.includes(p)) next[p] = (next[p] || 0) + 1; });
      if (guessCorrect) {
        imposterNames.forEach(n => { next[n] = (next[n] || 0) + 1; });
      }
    } else {
      // Imposters win: tie → +1 each, undetected → +2 each
      imposterNames.forEach(n => { next[n] = (next[n] || 0) + (isTie ? 1 : 2); });
      if (guessCorrect) {
        imposterNames.forEach(n => { next[n] = (next[n] || 0) + 1; });
      }
    }
    const nextRound = roundNumber + 1;
    setScores(next); setRoundNumber(nextRound); setPhase(PHASE.SCOREBOARD);
    persistCurrentState(players, next, nextRound, playedWords);
    recordRound(imposterCaught);
  };

  return {
    phase, players, scores, roundNumber, wordSource, selectedCategories, customWords,
    imposterMode, imposterCount, discussionMinutes, playedWords, playOrder, currentWord,
    imposterNames, currentTurnIdx, cardFlipped, votes, currentVoterIdx, imposterGuess,
    poolSize, unplayedCount, savedGame, timer, currentPlayer, computeResult,
    setWordSource, setSelectedCategories, setCustomWords, setImposterMode, setImposterCount,
    setDiscussionMinutes, setImposterGuess,
    startNewGame, resumeGame, addPlayer, removePlayer, goToConfig, goToPlayers, goToSetup,
    startRound, proceedFromHandoff, flipCard, flipCardBack, startVoting, submitVote,
    applyScoring,
    resetPlayedWords: () => setPlayedWords(new Set()),
    resetScores: () => {
      const zeroed: Scores = {};
      players.forEach(p => { zeroed[p] = 0; });
      setScores(zeroed); setRoundNumber(1);
    },
  };
}
