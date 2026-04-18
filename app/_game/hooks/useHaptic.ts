'use client';

export type Haptic = {
  tap: () => void;
  confirm: () => void;
  finale: () => void;
};

export function useHaptic(): Haptic {
  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  return {
    tap: () => vibrate(10),
    confirm: () => vibrate(30),
    finale: () => vibrate([100, 50, 100]),
  };
}
