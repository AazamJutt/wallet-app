"use client";

import { useRef, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useTheme } from "@/context/ThemeContext";
import { onlyDigits } from "@/lib/cardUtils";
import type { VaultBackup } from "@/lib/types";
import {
  AlertIcon,
  CheckIcon,
  DownloadIcon,
  LockIcon,
  UploadIcon,
  XIcon,
} from "./icons";

interface SettingsSheetProps {
  onClose: () => void;
}

const AUTO_LOCK_OPTIONS = [
  { minutes: 1, label: "After 1 minute" },
  { minutes: 5, label: "After 5 minutes" },
  { minutes: 15, label: "After 15 minutes" },
  { minutes: 30, label: "After 30 minutes" },
];

export default function SettingsSheet({ onClose }: SettingsSheetProps) {
  const wallet = useWallet();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMessage, setPinMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [pinSaving, setPinSaving] = useState(false);

  const [pendingBackup, setPendingBackup] = useState<VaultBackup | null>(null);
  const [importPin, setImportPin] = useState("");
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const [wipeConfirm, setWipeConfirm] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const handleChangePin = async () => {
    setPinMessage(null);
    if (newPin.length < 4) {
      setPinMessage({ type: "error", text: "PIN should be at least 4 digits." });
      return;
    }
    if (newPin !== confirmPin) {
      setPinMessage({ type: "error", text: "PINs don't match." });
      return;
    }
    setPinSaving(true);
    try {
      await wallet.changePin(newPin);
      setPinMessage({ type: "ok", text: "PIN updated." });
      setNewPin("");
      setConfirmPin("");
    } catch (e) {
      setPinMessage({ type: "error", text: "Couldn't update PIN. Try again." });
    } finally {
      setPinSaving(false);
    }
  };

  const handleExport = async () => {
    setExportMessage(null);
    try {
      const backup = await wallet.exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `wallet-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportMessage("Backup downloaded — it's encrypted with your current PIN.");
    } catch {
      setExportMessage("Nothing to export yet.");
    }
  };

  const handleFileChosen = async (file: File) => {
    setImportMessage(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as VaultBackup;
      if (parsed.app !== "wallet-app-backup") {
        setImportMessage("That file doesn't look like a Wallet backup.");
        return;
      }
      setPendingBackup(parsed);
    } catch {
      setImportMessage("Couldn't read that file.");
    }
  };

  const handleImport = async () => {
    if (!pendingBackup) return;
    setImporting(true);
    setImportMessage(null);
    try {
      const ok = await wallet.importBackup(pendingBackup, importPin);
      if (ok) {
        setImportMessage("Backup restored.");
        setPendingBackup(null);
        setImportPin("");
        onClose();
      } else {
        setImportMessage("That PIN doesn't match the backup file.");
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-950/70 backdrop-blur-sm animate-fade-in">
      <div className="mt-auto flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[28px] bg-ink-900 ring-1 ring-white/10 animate-sheet-in">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-1 safe-top">
          <div className="w-9" />
          <p className="text-[15px] font-semibold text-white/90">Settings</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 active:bg-white/10"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-10">
          {/* Lock now */}
          <section className="mt-4">
            <button
              type="button"
              onClick={() => {
                wallet.lock();
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3.5 ring-1 ring-white/[0.06] active:bg-white/[0.08]"
            >
              <LockIcon className="h-5 w-5 text-white/70" />
              <span className="text-[15px] text-white/90">Lock now</span>
            </button>
          </section>

          {/* Appearance Theme */}
          <section className="mt-6">
            <h3 className="mb-2 text-[12px] font-medium uppercase tracking-wide text-white/40">
              Appearance
            </h3>
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/[0.04] p-2 ring-1 ring-white/[0.06]">
              {(["dark", "light", "system"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  className={`flex items-center justify-center rounded-xl py-2.5 text-[13px] font-semibold capitalize transition ${
                    theme === mode
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-white/70 hover:bg-white/[0.06]"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </section>

          {/* Auto-lock */}
          <section className="mt-6">
            <h3 className="mb-2 text-[12px] font-medium uppercase tracking-wide text-white/40">
              Auto-lock
            </h3>
            <div className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06]">
              {AUTO_LOCK_OPTIONS.map((opt) => (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => wallet.setAutoLockMinutes(opt.minutes)}
                  className="flex w-full items-center justify-between border-b border-white/[0.05] px-4 py-3.5 text-left last:border-0 active:bg-white/[0.06]"
                >
                  <span className="text-[15px] text-white/85">{opt.label}</span>
                  {wallet.autoLockMinutes === opt.minutes && (
                    <CheckIcon className="h-[18px] w-[18px] text-white" />
                  )}
                </button>
              ))}
            </div>
            <p className="mt-2 px-1 text-[12px] text-white/40">
              Your wallet also locks immediately whenever it&apos;s backgrounded.
            </p>
          </section>

          {/* Change PIN */}
          <section className="mt-6">
            <h3 className="mb-2 text-[12px] font-medium uppercase tracking-wide text-white/40">
              Change PIN
            </h3>
            <div className="flex flex-col gap-3 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/[0.06]">
              <input
                type="password"
                inputMode="numeric"
                placeholder="New PIN"
                value={newPin}
                onChange={(e) => setNewPin(onlyDigits(e.target.value).slice(0, 8))}
                className="w-full rounded-xl bg-white/[0.06] px-3.5 py-3 text-[15px] tracking-[0.3em] text-white placeholder:tracking-normal placeholder:text-white/30 outline-none ring-1 ring-white/[0.08] focus:ring-white/25"
              />
              <input
                type="password"
                inputMode="numeric"
                placeholder="Confirm new PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(onlyDigits(e.target.value).slice(0, 8))}
                className="w-full rounded-xl bg-white/[0.06] px-3.5 py-3 text-[15px] tracking-[0.3em] text-white placeholder:tracking-normal placeholder:text-white/30 outline-none ring-1 ring-white/[0.08] focus:ring-white/25"
              />
              {pinMessage && (
                <p className={`text-[13px] ${pinMessage.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>
                  {pinMessage.text}
                </p>
              )}
              <button
                type="button"
                onClick={handleChangePin}
                disabled={pinSaving || !newPin || !confirmPin}
                className="rounded-xl bg-white py-2.5 text-[14px] font-semibold text-ink-950 active:scale-[0.99] disabled:opacity-40"
              >
                {pinSaving ? "Updating…" : "Update PIN"}
              </button>
            </div>
          </section>

          {/* Backup */}
          <section className="mt-6">
            <h3 className="mb-2 text-[12px] font-medium uppercase tracking-wide text-white/40">
              Backup
            </h3>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3.5 ring-1 ring-white/[0.06] active:bg-white/[0.08]"
              >
                <DownloadIcon className="h-5 w-5 text-white/70" />
                <span className="text-[15px] text-white/90">Export encrypted backup</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3.5 ring-1 ring-white/[0.06] active:bg-white/[0.08]"
              >
                <UploadIcon className="h-5 w-5 text-white/70" />
                <span className="text-[15px] text-white/90">Restore from backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChosen(file);
                  e.target.value = "";
                }}
              />
              {exportMessage && <p className="px-1 text-[13px] text-white/50">{exportMessage}</p>}
              {importMessage && !pendingBackup && (
                <p className="px-1 text-[13px] text-white/50">{importMessage}</p>
              )}

              {pendingBackup && (
                <div className="flex flex-col gap-3 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-amber-500/20">
                  <p className="text-[13px] text-white/70">
                    Enter the PIN that backup was created with. This will replace what&apos;s currently on
                    this device.
                  </p>
                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="Backup PIN"
                    value={importPin}
                    onChange={(e) => setImportPin(onlyDigits(e.target.value).slice(0, 8))}
                    className="w-full rounded-xl bg-white/[0.06] px-3.5 py-3 text-[15px] tracking-[0.3em] text-white placeholder:tracking-normal placeholder:text-white/30 outline-none ring-1 ring-white/[0.08] focus:ring-white/25"
                  />
                  {importMessage && <p className="text-[13px] text-red-400">{importMessage}</p>}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPendingBackup(null);
                        setImportPin("");
                        setImportMessage(null);
                      }}
                      className="flex-1 rounded-xl bg-white/[0.06] py-2.5 text-[14px] font-medium text-white/80"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleImport}
                      disabled={importing || !importPin}
                      className="flex-1 rounded-xl bg-white py-2.5 text-[14px] font-semibold text-ink-950 disabled:opacity-40"
                    >
                      {importing ? "Restoring…" : "Restore"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Danger zone */}
          <section className="mb-4 mt-8">
            <h3 className="mb-2 text-[12px] font-medium uppercase tracking-wide text-red-400/70">
              Danger zone
            </h3>
            {!wipeConfirm ? (
              <button
                type="button"
                onClick={() => setWipeConfirm(true)}
                className="flex w-full items-center gap-3 rounded-2xl bg-red-500/10 px-4 py-3.5 ring-1 ring-red-500/20 active:bg-red-500/20"
              >
                <AlertIcon className="h-5 w-5 text-red-400" />
                <span className="text-[15px] text-red-400">Erase all wallet data</span>
              </button>
            ) : (
              <div className="flex flex-col gap-3 rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/25">
                <p className="text-[13px] text-red-300">
                  This permanently deletes every card and your PIN from this device. There&apos;s no
                  undo unless you have an exported backup.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setWipeConfirm(false)}
                    className="flex-1 rounded-xl bg-white/[0.08] py-2.5 text-[14px] font-medium text-white/80"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await wallet.wipeEverything();
                      onClose();
                    }}
                    className="flex-1 rounded-xl bg-red-500 py-2.5 text-[14px] font-semibold text-white"
                  >
                    Erase everything
                  </button>
                </div>
              </div>
            )}
          </section>

          <p className="px-1 text-center text-[12px] text-white/30">
            Wallet stores everything locally, encrypted, on this device only. Nothing is ever sent
            anywhere.
          </p>
        </div>
      </div>
    </div>
  );
}
