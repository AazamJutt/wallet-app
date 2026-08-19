"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { VaultBackup, WalletCard, WalletCardDraft } from "@/lib/types";
import { generateId } from "@/lib/cardUtils";
import {
  DEFAULT_AUTO_LOCK_MINUTES,
  changePin as changePinStore,
  createVault,
  destroyVault,
  exportEncryptedBackup,
  getVaultMeta,
  importEncryptedBackup,
  persistCards,
  unlockVault,
  updateAutoLockMinutes,
  vaultExists,
} from "@/lib/vaultStore";

type Status = "checking" | "needs-setup" | "locked" | "unlocked";

interface WalletContextValue {
  status: Status;
  cards: WalletCard[];
  autoLockMinutes: number;
  error: string | null;
  setupVault: (pin: string) => Promise<void>;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  addCard: (draft: WalletCardDraft) => Promise<void>;
  updateCard: (id: string, draft: WalletCardDraft) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  reorderCards: (orderedIds: string[]) => Promise<void>;
  changePin: (newPin: string) => Promise<void>;
  setAutoLockMinutes: (minutes: number) => Promise<void>;
  exportBackup: () => Promise<VaultBackup>;
  importBackup: (backup: VaultBackup, pin: string) => Promise<boolean>;
  wipeEverything: () => Promise<void>;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");
  const [cards, setCards] = useState<WalletCard[]>([]);
  const [autoLockMinutes, setAutoLockMinutesState] = useState(DEFAULT_AUTO_LOCK_MINUTES);
  const [error, setError] = useState<string | null>(null);
  const keyRef = useRef<CryptoKey | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const exists = await vaultExists();
        setStatus(exists ? "locked" : "needs-setup");
      } catch (e) {
        console.error(e);
        setStatus("needs-setup");
      }
    })();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const setupVault = useCallback(async (pin: string) => {
    const key = await createVault(pin);
    keyRef.current = key;
    setCards([]);
    setAutoLockMinutesState(DEFAULT_AUTO_LOCK_MINUTES);
    setStatus("unlocked");
  }, []);

  const unlock = useCallback(async (pin: string) => {
    setError(null);
    const result = await unlockVault(pin);
    if (!result) {
      setError("That PIN doesn't match. Try again.");
      return false;
    }
    keyRef.current = result.key;
    setCards(result.cards);
    const meta = await getVaultMeta();
    setAutoLockMinutesState(meta?.autoLockMinutes ?? DEFAULT_AUTO_LOCK_MINUTES);
    setStatus("unlocked");
    return true;
  }, []);

  const lock = useCallback(() => {
    keyRef.current = null;
    setCards([]);
    setStatus("locked");
  }, []);

  const persist = useCallback(async (next: WalletCard[]) => {
    setCards(next);
    if (keyRef.current) {
      await persistCards(keyRef.current, next);
    }
  }, []);

  const addCard = useCallback(
    async (draft: WalletCardDraft) => {
      const now = Date.now();
      const card: WalletCard = { ...draft, id: generateId(), createdAt: now, updatedAt: now };
      await persist([card, ...cards]);
    },
    [cards, persist]
  );

  const updateCard = useCallback(
    async (id: string, draft: WalletCardDraft) => {
      const next = cards.map((c) => (c.id === id ? { ...c, ...draft, updatedAt: Date.now() } : c));
      await persist(next);
    },
    [cards, persist]
  );

  const deleteCard = useCallback(
    async (id: string) => {
      await persist(cards.filter((c) => c.id !== id));
    },
    [cards, persist]
  );

  const reorderCards = useCallback(
    async (orderedIds: string[]) => {
      const byId = new Map(cards.map((c) => [c.id, c]));
      const next = orderedIds.map((id) => byId.get(id)).filter((c): c is WalletCard => !!c);
      await persist(next);
    },
    [cards, persist]
  );

  const changePin = useCallback(
    async (newPin: string) => {
      if (!keyRef.current) throw new Error("Vault is locked.");
      const newKey = await changePinStore(keyRef.current, cards, newPin, autoLockMinutes);
      keyRef.current = newKey;
    },
    [cards, autoLockMinutes]
  );

  const setAutoLockMinutes = useCallback(async (minutes: number) => {
    setAutoLockMinutesState(minutes);
    await updateAutoLockMinutes(minutes);
  }, []);

  const exportBackup = useCallback(async () => exportEncryptedBackup(), []);

  const importBackup = useCallback(async (backup: VaultBackup, pin: string) => {
    await importEncryptedBackup(backup);
    const result = await unlockVault(pin);
    if (!result) {
      setError("Backup imported, but that PIN doesn't unlock it.");
      setStatus("locked");
      return false;
    }
    keyRef.current = result.key;
    setCards(result.cards);
    setAutoLockMinutesState(backup.meta.autoLockMinutes ?? DEFAULT_AUTO_LOCK_MINUTES);
    setStatus("unlocked");
    return true;
  }, []);

  const wipeEverything = useCallback(async () => {
    await destroyVault();
    keyRef.current = null;
    setCards([]);
    setStatus("needs-setup");
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      status,
      cards,
      autoLockMinutes,
      error,
      setupVault,
      unlock,
      lock,
      addCard,
      updateCard,
      deleteCard,
      reorderCards,
      changePin,
      setAutoLockMinutes,
      exportBackup,
      importBackup,
      wipeEverything,
      clearError,
    }),
    [
      status,
      cards,
      autoLockMinutes,
      error,
      setupVault,
      unlock,
      lock,
      addCard,
      updateCard,
      deleteCard,
      reorderCards,
      changePin,
      setAutoLockMinutes,
      exportBackup,
      importBackup,
      wipeEverything,
      clearError,
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a WalletProvider");
  return ctx;
}
