"use client";

import { useCallback } from "react";
import { useWallet } from "@/context/WalletContext";
import { useAutoLock } from "@/lib/useAutoLock";
import LockScreen from "./LockScreen";
import WalletHome from "./WalletHome";

export default function AppShell() {
  const wallet = useWallet();

  const handleLock = useCallback(() => wallet.lock(), [wallet]);
  useAutoLock(wallet.status === "unlocked", wallet.autoLockMinutes, handleLock);

  if (wallet.status === "checking") {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
      </div>
    );
  }

  if (wallet.status === "needs-setup") {
    return (
      <LockScreen
        mode="setup"
        error={wallet.error}
        onSubmitSetup={wallet.setupVault}
        onSubmitUnlock={wallet.unlock}
        onClearError={wallet.clearError}
      />
    );
  }

  if (wallet.status === "locked") {
    return (
      <LockScreen
        mode="unlock"
        error={wallet.error}
        onSubmitSetup={wallet.setupVault}
        onSubmitUnlock={wallet.unlock}
        onClearError={wallet.clearError}
      />
    );
  }

  return <WalletHome />;
}
