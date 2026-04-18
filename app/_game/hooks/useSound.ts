'use client';

import { useState, useEffect } from 'react';
import { playTick, playReveal } from '../lib/sounds';

const SOUND_KEY = 'hochstapler:sound';

export type Sound = {
  enabled: boolean;
  toggle: () => void;
  tick: () => void;
  reveal: () => void;
};

export function useSound(): Sound {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      setEnabled(localStorage.getItem(SOUND_KEY) === 'true');
    } catch {
      // Private Mode fallback
    }
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem(SOUND_KEY, String(next));
    } catch {
      // fail silently
    }
  };

  return {
    enabled,
    toggle,
    tick: () => { if (enabled) playTick(); },
    reveal: () => { if (enabled) playReveal(); },
  };
}
