"use client";

import { useMemo, useState } from "react";
import type { CardBrand, CardCategory, WalletCard, WalletCardDraft } from "@/lib/types";
import {
  CARD_COLOR_PRESETS,
  cvvLengthForBrand,
  detectBrand,
  formatCardNumber,
  formatExpiryInput,
  maxLengthForBrand,
  onlyDigits,
} from "@/lib/cardUtils";
import CardFace from "./CardFace";
import { CheckIcon, XIcon } from "./icons";

interface CardFormSheetProps {
  initial?: WalletCard;
  onCancel: () => void;
  onSave: (draft: WalletCardDraft) => Promise<void> | void;
}

const CATEGORIES: { value: CardCategory; label: string }[] = [
  { value: "credit", label: "Credit" },
  { value: "debit", label: "Debit" },
  { value: "prepaid", label: "Prepaid" },
  { value: "gift", label: "Gift card" },
  { value: "loyalty", label: "Loyalty" },
  { value: "id", label: "ID card" },
  { value: "other", label: "Other" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-white/45">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl bg-white/[0.06] px-3.5 py-3 text-[15px] text-white placeholder:text-white/30 ring-1 ring-white/[0.08] outline-none focus:ring-white/25 transition tabular-nums";

export default function CardFormSheet({ initial, onCancel, onSave }: CardFormSheetProps) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [holder, setHolder] = useState(initial?.holder ?? "");
  const [number, setNumber] = useState(initial?.number ?? "");
  const [expiry, setExpiry] = useState(
    initial ? `${initial.expiryMonth}/${initial.expiryYear.slice(-2)}` : ""
  );
  const [cvv, setCvv] = useState(initial?.cvv ?? "");
  const [bankName, setBankName] = useState(initial?.bankName ?? "");
  const [category, setCategory] = useState<CardCategory>(initial?.category ?? "credit");
  const [color, setColor] = useState(initial?.color ?? CARD_COLOR_PRESETS[1]);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  const brand: CardBrand = useMemo(() => detectBrand(onlyDigits(number)), [number]);
  const digits = onlyDigits(number);

  const previewCard: WalletCard = {
    id: "preview",
    label: label || "Card name",
    holder,
    number: digits,
    expiryMonth: expiry.split("/")[0]?.padEnd(2, "0").slice(0, 2) || "MM",
    expiryYear: expiry.split("/")[1] || "YY",
    cvv,
    brand,
    category,
    bankName,
    color,
    notes,
    createdAt: 0,
    updatedAt: 0,
  };

  const isValid = label.trim().length > 0 && digits.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    const [mm, yy] = expiry.split("/");
    const expiryMonth = mm && mm.length === 2 ? mm : "";
    const expiryYear = yy && yy.length === 2 ? yy : "";
    setSaving(true);
    try {
      await onSave({
        label: label.trim(),
        holder: holder.trim(),
        number: digits,
        expiryMonth,
        expiryYear,
        cvv: cvv.trim() || undefined,
        brand,
        category,
        bankName: bankName.trim() || undefined,
        color,
        notes: notes.trim() || undefined,
        pinned: initial?.pinned,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-950/70 backdrop-blur-sm animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="mt-auto flex max-h-[94dvh] flex-col overflow-hidden rounded-t-[28px] bg-ink-900 ring-1 ring-white/10 animate-sheet-in"
      >
        <div className="flex items-center justify-between px-4 pt-3.5 pb-1 safe-top">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 active:bg-white/10"
            aria-label="Cancel"
          >
            <XIcon className="h-5 w-5" />
          </button>
          <p className="text-[15px] font-semibold text-white/90">{initial ? "Edit card" : "Add card"}</p>
          <button
            type="submit"
            disabled={!isValid || saving}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white active:bg-white/10 disabled:opacity-30"
            aria-label="Save"
          >
            <CheckIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-10">
          <div className="mx-auto mt-3 max-w-sm">
            <CardFace card={previewCard} size="full" />
          </div>

          <div className="mt-5 flex flex-col gap-4">
            <Field label="Card name">
              <input
                className={inputClass}
                placeholder="e.g. Chase Sapphire"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={40}
              />
            </Field>

            <Field label="Card number">
              <input
                className={inputClass}
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                value={formatCardNumber(digits, brand)}
                onChange={(e) => setNumber(onlyDigits(e.target.value).slice(0, maxLengthForBrand(brand)))}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Expiry (MM/YY) · optional">
                <input
                  className={inputClass}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiryInput(e.target.value))}
                  maxLength={5}
                />
              </Field>
              <Field label="Security code">
                <input
                  className={inputClass}
                  placeholder="CVV"
                  inputMode="numeric"
                  value={cvv}
                  onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, cvvLengthForBrand(brand)))}
                  maxLength={4}
                />
              </Field>
            </div>

            <Field label="Cardholder name">
              <input
                className={inputClass}
                placeholder="As printed on the card"
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                maxLength={40}
              />
            </Field>

            <Field label="Bank / issuer (optional)">
              <input
                className={inputClass}
                placeholder="e.g. Chase, HBL, Wise"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                maxLength={40}
              />
            </Field>

            <Field label="Category">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                      category === c.value
                        ? "bg-white text-ink-950"
                        : "bg-white/[0.06] text-white/60 ring-1 ring-white/[0.08]"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Card color">
              <div className="flex flex-wrap gap-2.5">
                {CARD_COLOR_PRESETS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColor(hex)}
                    className="flex h-9 w-9 items-center justify-center rounded-full ring-2 transition"
                    style={{
                      backgroundColor: hex,
                      borderColor: "transparent",
                      outline: color === hex ? "2px solid white" : "none",
                      outlineOffset: 2,
                    }}
                    aria-label={`Choose color ${hex}`}
                  />
                ))}
              </div>
            </Field>

            <Field label="Notes (optional)">
              <textarea
                className={`${inputClass} min-h-[80px] resize-none`}
                placeholder="Anything worth remembering about this card"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={280}
              />
            </Field>

            {touched && !isValid && (
              <p className="text-[13px] text-red-400">
                Give the card a name and a number (at least 6 digits) to save it.
              </p>
            )}

            <button
              type="submit"
              disabled={!isValid || saving}
              className="mt-2 w-full rounded-2xl bg-white py-3.5 text-[15px] font-semibold text-ink-950 active:scale-[0.99] transition disabled:opacity-40"
            >
              {saving ? "Saving…" : initial ? "Save changes" : "Add card"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
