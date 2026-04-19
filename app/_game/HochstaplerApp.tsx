'use client';

import { useEffect, useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { useHaptic } from './hooks/useHaptic';
import { useSound } from './hooks/useSound';
import { PHASE } from './types';
import { SetupScreen } from './screens/SetupScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { PlayersScreen } from './screens/PlayersScreen';
import { ConfigScreen } from './screens/ConfigScreen';
import { HandoffScreen } from './screens/HandoffScreen';
import { RevealScreen } from './screens/RevealScreen';
import { DiscussionScreen } from './screens/DiscussionScreen';
import { VoteScreen } from './screens/VoteScreen';
import { ResultScreen } from './screens/ResultScreen';
import { ScoreboardScreen } from './screens/ScoreboardScreen';

const ONBOARDING_KEY = 'liar:onboarded';

export default function HochstaplerApp() {
  const g = useGameState();
  const haptic = useHaptic();
  const sound = useSound();
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setShowOnboarding(true);
    else setShowOnboarding(false);
  }, []);

  const handleOnboardingDone = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setShowOnboarding(false);
  };

  const activePhases: string[] = [PHASE.HANDOFF, PHASE.REVEAL, PHASE.DISCUSSION, PHASE.VOTE, PHASE.RESULT];
  const isInRound = activePhases.includes(g.phase);

  useEffect(() => {
    if (!isInRound) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isInRound]);

  const handleFlip = () => { haptic.tap(); g.flipCard(); };
  const handleFlipBack = () => { haptic.tap(); g.flipCardBack(); };
  const handleVote = (name: string) => { haptic.confirm(); g.submitVote(name); };
  const handleScoring = () => { haptic.finale(); sound.reveal(); g.applyScoring(); };

  return (
    <div className="h-screen w-full bg-[#fdf7f0] text-stone-800 relative flex flex-col">
      {showOnboarding && <OnboardingScreen onDone={handleOnboardingDone} />}

      {/* Hintergrund-Gradienten */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(253,164,175,0.35),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(253,186,116,0.22),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(196,181,253,0.18),transparent_50%)]" />
      </div>

      {/* ── HEADER ── immer sichtbar, außerhalb des Scrollbereichs */}
      <header
        className="relative z-10 flex-shrink-0 max-w-2xl w-full mx-auto px-5 flex items-center justify-between"
        style={{ paddingTop: 'max(1.25rem, calc(env(safe-area-inset-top) + 0.5rem))', paddingBottom: '1rem' }}
      >
        <h1 className="font-display text-3xl font-black italic tracking-tight leading-none">
          Li<span className="text-rose-500">ar</span>
        </h1>
        {g.phase !== PHASE.SETUP && (
          <div className="text-right font-mono-game text-[10px] uppercase tracking-widest text-stone-400">
            <div>Runde {g.roundNumber}</div>
            <div>{g.players.length} Spieler</div>
          </div>
        )}
      </header>

      {/* ── MAIN — scrollbarer Inhaltsbereich ── */}
      <main
        className="relative z-10 flex-1 min-h-0 overflow-y-auto max-w-2xl w-full mx-auto px-5"
        style={{
          overscrollBehavior: 'none',
          paddingBottom: g.phase === PHASE.CONFIG
            ? 'calc(5rem + max(0.75rem, env(safe-area-inset-bottom)))'
            : 'max(1.5rem, env(safe-area-inset-bottom))',
        }}
      >
        {g.phase === PHASE.CONFIG && (
          <ConfigScreen
            selectedCategories={g.selectedCategories}
            setSelectedCategories={g.setSelectedCategories}
            imposterMode={g.imposterMode}
            setImposterMode={g.setImposterMode}
            imposterCount={g.imposterCount}
            setImposterCount={g.setImposterCount}
            discussionMinutes={g.discussionMinutes}
            setDiscussionMinutes={g.setDiscussionMinutes}
            poolSize={g.poolSize}
            unplayedCount={g.unplayedCount}
            onResetHistory={g.resetPlayedWords}
            soundEnabled={sound.enabled}
            onToggleSound={sound.toggle}
            playerCount={g.players.length}
          />
        )}
        {g.phase === PHASE.SETUP && (
          <SetupScreen onStart={g.startNewGame} onResume={g.resumeGame} savedGame={g.savedGame} />
        )}
        {g.phase === PHASE.PLAYERS && (
          <PlayersScreen
            players={g.players}
            addPlayer={g.addPlayer}
            removePlayer={g.removePlayer}
            onContinue={g.goToConfig}
          />
        )}
        {g.phase === PHASE.HANDOFF && (
          <HandoffScreen
            playerName={g.currentPlayer()}
            turnIdx={g.currentTurnIdx}
            total={g.players.length}
            onContinue={g.proceedFromHandoff}
          />
        )}
        {g.phase === PHASE.REVEAL && g.currentWord && (
          <RevealScreen
            playerName={g.currentPlayer()}
            isImposter={g.imposterNames.includes(g.currentPlayer())}
            word={g.currentWord}
            imposterMode={g.imposterMode}
            flipped={g.cardFlipped}
            onFlip={handleFlip}
            onFlipBack={handleFlipBack}
            turnIdx={g.currentTurnIdx}
            total={g.players.length}
          />
        )}
        {g.phase === PHASE.DISCUSSION && (
          <DiscussionScreen
            timeLeft={g.timer.timeLeft}
            running={g.timer.running}
            onToggle={g.timer.toggle}
            onReset={() => g.timer.reset(g.discussionMinutes * 60)}
            onVote={g.startVoting}
            onTick={sound.tick}
            starterName={g.players[g.playOrder[0]]}
          />
        )}
        {g.phase === PHASE.VOTE && (
          <VoteScreen
            voter={g.players[g.currentVoterIdx]}
            candidates={g.players}
            onVote={handleVote}
            idx={g.currentVoterIdx}
            total={g.players.length}
          />
        )}
        {g.phase === PHASE.RESULT && g.currentWord && (
          <ResultScreen
            result={g.computeResult()}
            word={g.currentWord}
            imposterMode={g.imposterMode}
            imposterGuess={g.imposterGuess}
            setImposterGuess={g.setImposterGuess}
            onContinue={handleScoring}
          />
        )}
        {g.phase === PHASE.SCOREBOARD && (
          <ScoreboardScreen
            scores={g.scores}
            players={g.players}
            onNextRound={g.goToConfig}
            onEnd={g.goToSetup}
            onResetScores={g.resetScores}
          />
        )}
      </main>

      {/* ── CONFIG-FOOTER ── fixed, unabhängig von jeder Flex/Scroll-Logik ── */}
      {g.phase === PHASE.CONFIG && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: '#fdf7f0',
            paddingTop: '0.75rem',
            paddingLeft: '1.25rem',
            paddingRight: '1.25rem',
            paddingBottom: 'max(0.75rem, calc(env(safe-area-inset-bottom) + 0.25rem))',
            boxShadow: '0 -10px 20px -10px rgba(14,14,28,0.15)',
            display: 'flex',
            gap: '0.5rem',
          }}
        >
          <button
            onClick={g.goToPlayers}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'white',
              border: '1px solid #e7e5e4',
              borderRadius: '0.75rem',
              color: '#78716c',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
            }}
          >
            ← Spieler
          </button>
          <button
            onClick={g.startRound}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#f43f5e',
              border: 'none',
              borderRadius: '0.75rem',
              color: 'white',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              cursor: 'pointer',
            }}
          >
            Runde starten →
          </button>
        </div>
      )}
    </div>
  );
}
