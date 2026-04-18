'use client';

import { useEffect, useRef } from 'react';

export function DiscussionScreen({ timeLeft, running, onToggle, onReset, onVote, onTick }: {
  timeLeft: number;
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
  onVote: () => void;
  onTick: () => void;
}) {
  const prevTimeLeft = useRef(timeLeft);

  useEffect(() => {
    // Play tick sound each second during the last minute
    if (running && timeLeft > 0 && timeLeft <= 60 && timeLeft !== prevTimeLeft.current) {
      onTick();
    }
    prevTimeLeft.current = timeLeft;
  }, [timeLeft, running, onTick]);
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
