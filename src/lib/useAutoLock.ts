"use client";

import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS: Array<keyof DocumentEventMap> = [
  "pointerdown",
  "keydown",
  "touchstart",
  "wheel",
];

/**
 * Locks the vault after `minutes` of inactivity or after being backgrounded
 * for longer than the configured auto-lock duration.
 */
export function useAutoLock(active: boolean, minutes: number, onLock: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHiddenTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || minutes <= 0) return;

    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(onLock, minutes * 60_000);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        lastHiddenTimeRef.current = Date.now();
      } else if (document.visibilityState === "visible") {
        if (lastHiddenTimeRef.current) {
          const elapsed = Date.now() - lastHiddenTimeRef.current;
          if (elapsed >= minutes * 60_000) {
            onLock();
            return;
          }
        }
        reset();
      }
    };

    ACTIVITY_EVENTS.forEach((evt) => document.addEventListener(evt, reset, { passive: true }));
    document.addEventListener("visibilitychange", handleVisibility);
    reset();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) => document.removeEventListener(evt, reset));
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [active, minutes, onLock]);
}
