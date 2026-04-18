'use client';

import { useState, useEffect, useRef } from 'react';

export type Timer = {
  timeLeft: number;
  running: boolean;
  toggle: () => void;
  stop: () => void;
  reset: (seconds: number) => void;
};

export function useTimer(): Timer {
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (running && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && running) {
      setRunning(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [running, timeLeft]);

  return {
    timeLeft,
    running,
    toggle: () => setRunning(r => !r),
    stop: () => setRunning(false),
    reset: (seconds: number) => { setTimeLeft(seconds); setRunning(false); },
  };
}
