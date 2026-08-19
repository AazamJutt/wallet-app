"use client";

import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS: Array<keyof DocumentEventMap> = [
  "pointerdown",
  "keydown",
  "touchstart",
  "wheel",
];

/**
 * Locks the vault after `minutes` of inactivity, and immediately whenever the
 * app is backgrounded (tab hidden / app switched away on mobile) — the same
 * behavior you'd expect from a wallet app holding sensitive data.
 */
export function useAutoLock(active: boolean, minutes: number, onLock: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active || minutes <= 0) return;

    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(onLock, minutes * 60_000);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        onLock();
      } else {
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
