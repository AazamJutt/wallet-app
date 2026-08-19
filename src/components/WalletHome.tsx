"use client";

import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useTheme } from "@/context/ThemeContext";
import type { WalletCard, WalletCardDraft } from "@/lib/types";
import CardStack from "./CardStack";
import CardDetailSheet from "./CardDetailSheet";
import CardFormSheet from "./CardFormSheet";
import SettingsSheet from "./SettingsSheet";
import { GearIcon, MoonIcon, PlusIcon, SunIcon } from "./icons";

type Overlay =
  | { kind: "none" }
  | { kind: "detail"; card: WalletCard }
  | { kind: "add" }
  | { kind: "edit"; card: WalletCard }
  | { kind: "settings" };

export default function WalletHome() {
  const wallet = useWallet();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [overlay, setOverlay] = useState<Overlay>({ kind: "none" });

  const handleSave = async (draft: WalletCardDraft) => {
    if (overlay.kind === "edit") {
      await wallet.updateCard(overlay.card.id, draft);
    } else {
      await wallet.addCard(draft);
    }
    setOverlay({ kind: "none" });
  };

  const handleDelete = async (id: string) => {
    await wallet.deleteCard(id);
    setOverlay({ kind: "none" });
  };

  return (
    <div className="relative flex h-dvh w-full flex-col">
      <header className="safe-top flex items-center justify-between px-5 pb-2 pt-4">
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">
          Wallet
        </h1>
        <div className="flex items-center gap-2">
          {/* Quick Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full glass active:scale-95 transition"
            aria-label="Toggle theme"
            title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            {resolvedTheme === "dark" ? (
              <SunIcon className="h-5 w-5 text-amber-300" />
            ) : (
              <MoonIcon className="h-5 w-5 text-slate-700" />
            )}
          </button>
          {/* Settings */}
          <button
            type="button"
            onClick={() => setOverlay({ kind: "settings" })}
            className="flex h-10 w-10 items-center justify-center rounded-full glass active:scale-95 transition"
            aria-label="Settings"
          >
            <GearIcon className="h-5 w-5 text-slate-700 dark:text-white/80" />
          </button>
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        <CardStack
          cards={wallet.cards}
          onSelect={(card) => setOverlay({ kind: "detail", card })}
          onAdd={() => setOverlay({ kind: "add" })}
        />
      </div>

      <button
        type="button"
        onClick={() => setOverlay({ kind: "add" })}
        className="fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-card-lg active:scale-95 transition"
        style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
        aria-label="Add card"
      >
        <PlusIcon className="h-6 w-6 shrink-0" />
      </button>

      {overlay.kind === "detail" && (
        <CardDetailSheet
          card={overlay.card}
          onClose={() => setOverlay({ kind: "none" })}
          onEdit={() => setOverlay({ kind: "edit", card: overlay.card })}
          onDelete={() => handleDelete(overlay.card.id)}
        />
      )}

      {(overlay.kind === "add" || overlay.kind === "edit") && (
        <CardFormSheet
          initial={overlay.kind === "edit" ? overlay.card : undefined}
          onCancel={() => setOverlay({ kind: "none" })}
          onSave={handleSave}
        />
      )}

      {overlay.kind === "settings" && <SettingsSheet onClose={() => setOverlay({ kind: "none" })} />}
    </div>
  );
}
