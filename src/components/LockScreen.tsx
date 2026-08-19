"use client";

import { useCallback, useEffect, useState } from "react";
import { LockIcon } from "./icons";

const PIN_LENGTH = 6;

interface LockScreenProps {
  mode: "setup" | "unlock";
  error?: string | null;
  onSubmitSetup: (pin: string) => Promise<void> | void;
  onSubmitUnlock: (pin: string) => Promise<boolean> | boolean;
  onClearError?: () => void;
}

export default function LockScreen({
  mode,
  error,
  onSubmitSetup,
  onSubmitUnlock,
  onClearError,
}: LockScreenProps) {
  const [stage, setStage] = useState<"enter" | "confirm">("enter");
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false);

  const reset = useCallback(() => {
    setPin("");
  }, []);

  useEffect(() => {
    // If the caller switches modes, start clean.
    setStage("enter");
    setPin("");
    setFirstPin("");
    setMismatch(false);
  }, [mode]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 420);
  }, []);

  const handleComplete = useCallback(
    async (value: string) => {
      if (mode === "unlock") {
        setBusy(true);
        const ok = await onSubmitUnlock(value);
        setBusy(false);
        if (!ok) {
          triggerShake();
          setPin("");
        }
        return;
      }

      // setup mode
      if (stage === "enter") {
        setFirstPin(value);
        setPin("");
        setStage("confirm");
        return;
      }

      if (value !== firstPin) {
        setMismatch(true);
        triggerShake();
        setPin("");
        setStage("enter");
        setFirstPin("");
        return;
      }

      setMismatch(false);
      setBusy(true);
      await onSubmitSetup(value);
      setBusy(false);
    },
    [mode, stage, firstPin, onSubmitSetup, onSubmitUnlock, triggerShake]
  );

  const press = useCallback(
    (digit: string) => {
      if (busy) return;
      onClearError?.();
      setPin((prev) => (prev.length >= PIN_LENGTH ? prev : prev + digit));
    },
    [busy, onClearError]
  );

  const backspace = useCallback(() => {
    if (busy) return;
    setPin((prev) => prev.slice(0, -1));
  }, [busy]);

  // Side effects (calling out to the parent, mutating other state) must not
  // live inside the setPin updater above — React may invoke updaters more
  // than once, so completion is handled here instead, once per full PIN.
  useEffect(() => {
    if (!busy && pin.length === PIN_LENGTH) {
      void handleComplete(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") press(e.key);
      else if (e.key === "Backspace") backspace();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, backspace]);

  const title =
    mode === "unlock"
      ? "Enter your PIN"
      : stage === "enter"
      ? "Create a PIN"
      : "Confirm your PIN";

  const subtitle =
    mode === "unlock"
      ? "Unlock your wallet"
      : stage === "enter"
      ? "You'll use this to unlock your wallet"
      : "Enter it once more to confirm";

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-between safe-top safe-bottom px-6 py-10">
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.07] ring-1 ring-white/10">
          <LockIcon className="h-6 w-6 text-white/80" />
        </div>
        <div className="text-center">
          <p className="text-[19px] font-semibold text-white">{title}</p>
          <p className="mt-1 text-[14px] text-white/50">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className={`flex gap-4 ${shake ? "animate-shake" : ""}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <span
              key={i}
              className={`h-3.5 w-3.5 rounded-full border border-white/40 transition-all ${
                i < pin.length ? "scale-110 bg-white" : "bg-transparent"
              }`}
            />
          ))}
        </div>
        <p className="h-5 text-[13px] font-medium text-red-400">
          {error || (mismatch ? "PINs didn't match — try again." : "")}
        </p>
      </div>

      <Keypad onPress={press} onBackspace={backspace} disabled={busy} />
    </div>
  );
}

function Keypad({
  onPress,
  onBackspace,
  disabled,
}: {
  onPress: (d: string) => void;
  onBackspace: () => void;
  disabled: boolean;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
  return (
    <div className="grid w-full max-w-[280px] grid-cols-3 gap-x-6 gap-y-4">
      {keys.map((k, idx) => {
        if (k === "") return <div key={idx} />;
        if (k === "⌫") {
          return (
            <button
              key={idx}
              type="button"
              onClick={onBackspace}
              disabled={disabled}
              className="flex h-16 items-center justify-center text-[15px] font-medium text-white/70 active:opacity-50"
              aria-label="Backspace"
            >
              ⌫
            </button>
          );
        }
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onPress(k)}
            disabled={disabled}
            className="flex h-16 w-16 items-center justify-center justify-self-center rounded-full text-[26px] font-medium text-white glass active:scale-95 transition disabled:opacity-40"
          >
            {k}
          </button>
        );
      })}
    </div>
  );
}
