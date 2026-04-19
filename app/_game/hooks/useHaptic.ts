'use client';

import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

export type Haptic = {
  tap: () => void;
  confirm: () => void;
  finale: () => void;
};

async function safeVibrate(fn: () => Promise<void>, fallbackMs?: number | number[]) {
  try {
    await fn();
  } catch {
    if (typeof navigator !== "undefined" && navigator.vibrate && fallbackMs !== undefined) {
      navigator.vibrate(fallbackMs);
    }
  }
}

export function useHaptic(): Haptic {
  return {
    tap: () => safeVibrate(
      () => Haptics.impact({ style: ImpactStyle.Light }),
      10
    ),
    confirm: () => safeVibrate(
      () => Haptics.notification({ type: NotificationType.Success }),
      30
    ),
    finale: () => safeVibrate(
      () => Haptics.vibrate({ duration: 300 }),
      [100, 50, 100]
    ),
  };
}
