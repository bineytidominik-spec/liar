'use client';

import { useGameState } from './hooks/useGameState';
import { useHaptic } from './hooks/useHaptic';
import { useSound } from './hooks/useSound';
import { PHASE } from './types';
import { SetupScreen } from './screens/SetupScreen';
import { PlayersScreen } from './screens/PlayersScreen';
import { ConfigScreen } from './screens/ConfigScreen';
import { HandoffScreen } from './screens/HandoffScreen';
import { RevealScreen } from './screens/RevealScreen';
import { DiscussionScreen } from './screens/DiscussionScreen';
import { VoteScreen } from './screens/VoteScreen';
import { ResultScreen } from './screens/ResultScreen';
import { ScoreboardScreen } from './screens/ScoreboardScreen';

export default function HochstaplerApp() {
  const g = useGameState();
  const haptic = useHaptic();
  const sound = useSound();

  const handleFlip = () => { haptic.tap(); g.flipCard(); };
  const handleFlipBack = () => { haptic.tap(); g.flipCardBack(); };
  const handleVote = (name: string) => { haptic.confirm(); g.submitVote(name); };
  const handleScoring = () => { haptic.finale(); sound.reveal(); g.applyScoring(); };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-stone-100 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(234,179,8,0.04),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-8 min-h-screen flex flex-col">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <div className="font-mono-game text-[10px] uppercase tracking-[0.3em] text-stone-500">Ein Partyspiel</div>
            <h1 className="font-display text-3xl font-black italic tracking-tight leading-none mt-1">
              Hoch<span className="text-red-500">stapler</span>
            </h1>
          </div>
          {g.phase !== PHASE.SETUP && (
            <div className="text-right font-mono-game text-[10px] uppercase tracking-widest text-stone-500">
              <div>Runde {g.roundNumber}</div>
              <div>{g.players.length} Spieler</div>
            </div>
          )}
        </header>

        <main className="flex-1 flex flex-col">
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

          {g.phase === PHASE.CONFIG && (
            <ConfigScreen
              wordSource={g.wordSource} setWordSource={g.setWordSource}
              selectedCategories={g.selectedCategories} setSelectedCategories={g.setSelectedCategories}
              customWords={g.customWords} setCustomWords={g.setCustomWords}
              imposterMode={g.imposterMode} setImposterMode={g.setImposterMode}
              discussionMinutes={g.discussionMinutes} setDiscussionMinutes={g.setDiscussionMinutes}
              poolSize={g.poolSize} unplayedCount={g.unplayedCount}
              onResetHistory={g.resetPlayedWords}
              onBack={g.goToPlayers}
              onStart={g.startRound}
              soundEnabled={sound.enabled}
              onToggleSound={sound.toggle}
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
              isImposter={g.currentPlayer() === g.imposterName}
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
            />
          )}
        </main>
      </div>
    </div>
  );
}
