'use client';

import { useState, useMemo, useEffect } from 'react';
import { PHASE, type Phase, type ImposterMode, type WordSource, type CurrentWord, type CustomWord, type Scores, type Votes, type ResultData } from '../types';
import { WORD_PACKS, getAllWordsFromCategories, type Category } from '../wordpacks';
import { shuffle, pickRandom, pickWordAntiRepeat } from '../utils';
import { useTimer, type Timer } from './useTimer';
import { saveGame, loadGame, clearGame, type PersistedState } from '../storage';

export type GameState = {
  phase: Phase;
  players: string[];
  scores: Scores;
  roundNumber: number;
  wordSource: WordSource;
  selectedCategories: Category[];
  customWords: CustomWord[];
  imposterMode: ImposterMode;
  discussionMinutes: number;
  playedWords: Set<string>;
  playOrder: number[];
  currentWord: CurrentWord | null;
  imposterName: string | null;
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
  const [discussionMinutes, setDiscussionMinutes] = useState(3);
  const [playedWords, setPlayedWords] = useState<Set<string>>(new Set());
  const [playOrder, setPlayOrder] = useState<number[]>([]);
  const [currentWord, setCurrentWord] = useState<CurrentWord | null>(null);
  const [imposterName, setImposterName] = useState<string | null>(null);
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
    const imposterCaught = topVoted.length === 1 && topVoted[0] === imposterName;
    return { imposterName, voteCounts, imposterCaught, topVoted };
  };

  const applyPersistedState = (s: PersistedState) => {
    setPlayers(s.players);
    setScores(s.scores);
    setRoundNumber(s.roundNumber);
    setWordSource(s.wordSource);
    setSelectedCategories(s.selectedCategories);
    setCustomWords(s.customWords);
    setImposterMode(s.imposterMode);
    setDiscussionMinutes(s.discussionMinutes);
    setPlayedWords(new Set(s.playedWords));
  };

  const startNewGame = () => {
    clearGame(); setSavedGame(null);
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
      wordSource, selectedCategories, customWords, imposterMode, discussionMinutes,
      playedWords: [...nextPlayedWords],
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
    setPlayers(p => p.filter(x => x !== name));
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

    const order = shuffle(players.map((_, i) => i));
    setPlayOrder(order);
    setImposterName(players[Math.floor(Math.random() * players.length)]);
    setCurrentTurnIdx(0); setCardFlipped(false);
    setVotes({}); setCurrentVoterIdx(0); setImposterGuess('');
    setPhase(PHASE.HANDOFF);
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
        setPhase(PHASE.HANDOFF);
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
    if (imposterCaught) {
      players.forEach(p => { if (p !== imposterName) next[p] = (next[p] || 0) + 1; });
      if (imposterGuess && imposterGuess.trim().toLowerCase() === currentWord?.word.toLowerCase())
        next[imposterName!] = (next[imposterName!] || 0) + 1;
    } else {
      // 1 point on tie (no majority), 2 points if fully undetected
      next[imposterName!] = (next[imposterName!] || 0) + (isTie ? 1 : 2);
      if (imposterGuess && imposterGuess.trim().toLowerCase() === currentWord?.word.toLowerCase())
        next[imposterName!] = (next[imposterName!] || 0) + 1;
    }
    const nextRound = roundNumber + 1;
    setScores(next); setRoundNumber(nextRound); setPhase(PHASE.SCOREBOARD);
    // Auto-save on scoreboard
    persistCurrentState(players, next, nextRound, playedWords);
  };

  return {
    phase, players, scores, roundNumber, wordSource, selectedCategories, customWords,
    imposterMode, discussionMinutes, playedWords, playOrder, currentWord, imposterName,
    currentTurnIdx, cardFlipped, votes, currentVoterIdx, imposterGuess,
    poolSize, unplayedCount, savedGame, timer, currentPlayer, computeResult,
    setWordSource, setSelectedCategories, setCustomWords, setImposterMode,
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
