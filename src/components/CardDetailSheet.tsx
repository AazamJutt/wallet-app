"use client";

import { useState } from "react";
import type { WalletCard } from "@/lib/types";
import {
  brandLabel,
  formatCardNumber,
  formatExpiryDisplay,
  hasExpiry,
  isCardExpired,
  maskCardNumber,
} from "@/lib/cardUtils";
import CardFace from "./CardFace";
import QRCodeDisplay from "./QRCodeDisplay";
import { AlertIcon, CheckIcon, CopyIcon, EyeIcon, EyeOffIcon, PencilIcon, TrashIcon, XIcon } from "./icons";

interface CardDetailSheetProps {
  card: WalletCard;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function DetailRow({
  label,
  value,
  monospace = true,
  masked,
  onToggleMask,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  monospace?: boolean;
  masked?: boolean;
  onToggleMask?: () => void;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] py-3.5 last:border-0">
      <div className="min-w-0">
        <p className="text-[12px] text-white/45">{label}</p>
        <p className={`mt-0.5 truncate text-[16px] text-white ${monospace ? "tabular-nums" : ""}`}>
          {value}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {onToggleMask && (
          <button
            type="button"
            onClick={onToggleMask}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 active:bg-white/10"
            aria-label={masked ? "Show" : "Hide"}
          >
            {masked ? <EyeIcon className="h-[18px] w-[18px]" /> : <EyeOffIcon className="h-[18px] w-[18px]" />}
          </button>
        )}
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 active:bg-white/10"
            aria-label="Copy"
          >
            {copied ? (
              <CheckIcon className="h-[18px] w-[18px] text-emerald-400" />
            ) : (
              <CopyIcon className="h-[18px] w-[18px]" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CardDetailSheet({ card, onClose, onEdit, onDelete }: CardDetailSheetProps) {
  const [showNumber, setShowNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const copy = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField((f) => (f === field ? null : f)), 1500);
    } catch {
      // Clipboard API unavailable — fail silently, the value is still visible on screen.
    }
  };

  const expired = isCardExpired(card.expiryMonth, card.expiryYear);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-950/70 backdrop-blur-sm animate-fade-in">
      <div className="mt-auto flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[28px] bg-ink-900 ring-1 ring-white/10 animate-sheet-in">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-1 safe-top">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 active:bg-white/10"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
          <p className="text-[15px] font-semibold text-white/90">Card details</p>
          <button
            type="button"
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 active:bg-white/10"
            aria-label="Edit"
          >
            <PencilIcon className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-8">
          <div className="mx-auto mt-2 max-w-sm">
            <CardFace card={card} size="full" />
          </div>

          {/* Scannable Pass QR Code Section */}
          {card.qrCodeData && (
            <div className="mx-auto mt-4 flex max-w-sm flex-col items-center justify-center rounded-2xl bg-white p-5 shadow-lg text-slate-900 ring-1 ring-slate-200">
              <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Pass / Ticket QR Code
              </p>
              <QRCodeDisplay value={card.qrCodeData} size={200} className="shadow-none p-1" />
              <p className="mt-2 text-[12px] font-mono text-slate-600 truncate max-w-full">
                {card.qrCodeData}
              </p>
            </div>
          )}

          {expired && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 py-2.5 text-amber-300 ring-1 ring-amber-500/20">
              <AlertIcon className="h-4 w-4 shrink-0" />
              <p className="text-[13px]">This card&apos;s expiry date has passed.</p>
            </div>
          )}

          <div className="mt-5 rounded-2xl bg-white/[0.03] px-4 ring-1 ring-white/[0.06]">
            <DetailRow
              label="Card number"
              value={showNumber ? formatCardNumber(card.number, card.brand) : maskCardNumber(card.number, card.brand)}
              masked={!showNumber}
              onToggleMask={() => setShowNumber((v) => !v)}
              onCopy={() => copy("number", card.number)}
              copied={copiedField === "number"}
            />
            <DetailRow
              label="Cardholder"
              value={card.holder || "—"}
              monospace={false}
              onCopy={card.holder ? () => copy("holder", card.holder) : undefined}
              copied={copiedField === "holder"}
            />
            {hasExpiry(card.expiryMonth, card.expiryYear) && (
              <DetailRow
                label="Expiry date"
                value={formatExpiryDisplay(card.expiryMonth, card.expiryYear)}
                onCopy={() => copy("expiry", formatExpiryDisplay(card.expiryMonth, card.expiryYear))}
                copied={copiedField === "expiry"}
              />
            )}
            {card.cvv && (
              <DetailRow
                label="Security code"
                value={showCvv ? card.cvv : "•".repeat(card.cvv.length)}
                masked={!showCvv}
                onToggleMask={() => setShowCvv((v) => !v)}
                onCopy={() => copy("cvv", card.cvv!)}
                copied={copiedField === "cvv"}
              />
            )}
            <DetailRow label="Network" value={brandLabel(card.brand)} monospace={false} />
            {card.bankName && <DetailRow label="Issuer" value={card.bankName} monospace={false} />}
            <DetailRow label="Category" value={capitalize(card.category)} monospace={false} />
          </div>

          {card.notes && (
            <div className="mt-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
              <p className="text-[12px] text-white/45">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-[14px] text-white/80">{card.notes}</p>
            </div>
          )}

          <div className="mt-6">
            {!confirmingDelete ? (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 py-3.5 text-[15px] font-medium text-red-400 active:bg-red-500/20"
              >
                <TrashIcon className="h-[18px] w-[18px]" />
                Delete card
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="flex-1 rounded-2xl bg-white/[0.06] py-3.5 text-[15px] font-medium text-white/80 active:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex-1 rounded-2xl bg-red-500 py-3.5 text-[15px] font-semibold text-white active:bg-red-600"
                >
                  Confirm delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
