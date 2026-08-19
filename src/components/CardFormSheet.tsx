"use client";

import { useMemo, useState, useRef } from "react";
import type { CardBrand, CardCategory, WalletCard, WalletCardDraft } from "@/lib/types";
import {
  CARD_COLOR_PRESETS,
  cvvLengthForBrand,
  detectBrand,
  formatCardNumber,
  maxLengthForBrand,
  onlyDigits,
} from "@/lib/cardUtils";
import CardFace from "./CardFace";
import QRScannerModal from "./QRScannerModal";
import { CheckIcon, XIcon } from "./icons";

interface CardFormSheetProps {
  initial?: WalletCard;
  initialCategory?: CardCategory;
  initialDraftData?: Partial<WalletCardDraft>;
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

export default function CardFormSheet({
  initial,
  initialCategory,
  initialDraftData,
  onCancel,
  onSave,
}: CardFormSheetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState(initial?.label ?? initialDraftData?.label ?? "");
  const [holder, setHolder] = useState(initial?.holder ?? initialDraftData?.holder ?? "");
  const [number, setNumber] = useState(initial?.number ?? initialDraftData?.number ?? "");
  const [expiry, setExpiry] = useState(
    initial ? `${initial.expiryMonth}/${initial.expiryYear.slice(-2)}` : ""
  );
  const [cvv, setCvv] = useState(initial?.cvv ?? "");
  const [bankName, setBankName] = useState(initial?.bankName ?? initialDraftData?.bankName ?? "");
  const [category, setCategory] = useState<CardCategory>(
    initial?.category ?? initialCategory ?? initialDraftData?.category ?? "credit"
  );
  const [color, setColor] = useState(initial?.color ?? CARD_COLOR_PRESETS[1]);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [cardImage, setCardImage] = useState<string | undefined>(initial?.cardImage);
  const [qrCodeData, setQrCodeData] = useState<string | undefined>(initial?.qrCodeData);
  const [showQRScanner, setShowQRScanner] = useState(false);
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
    cardImage,
    qrCodeData,
    createdAt: 0,
    updatedAt: 0,
  };

  const isValid = label.trim().length > 0 && digits.length >= 6;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        setCardImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
        cardImage,
        qrCodeData: qrCodeData?.trim() || undefined,
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
                placeholder="e.g. Chase Sapphire, Driver ID"
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

            <div className="grid grid-cols-2 gap-3">
              <Field label="Expiry (MM/YY)">
                <input
                  className={inputClass}
                  placeholder="08/29"
                  inputMode="numeric"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
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

            {/* Custom Card Image Upload */}
            <Field label="Card photo / ID image (optional)">
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 rounded-xl bg-white/[0.06] px-4 py-3 text-[14px] font-medium text-white/90 ring-1 ring-white/[0.08] hover:bg-white/10 active:scale-[0.98] transition"
                  >
                    {cardImage ? "Change Card Image" : "Upload ID / Card Image"}
                  </button>
                  {cardImage && (
                    <button
                      type="button"
                      onClick={() => setCardImage(undefined)}
                      className="rounded-xl bg-red-500/15 px-3 py-3 text-[13px] font-medium text-red-400 active:scale-95"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </Field>

            {/* Pass QR Code Section */}
            <Field label="Pass / Ticket QR Code (optional)">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    className={`${inputClass} flex-1`}
                    placeholder="QR Code payload or URL"
                    value={qrCodeData || ""}
                    onChange={(e) => setQrCodeData(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowQRScanner(true)}
                    className="shrink-0 rounded-xl bg-emerald-500/20 px-3.5 py-2.5 text-[13px] font-bold text-emerald-400 ring-1 ring-emerald-500/30 hover:bg-emerald-500/30 active:scale-95 transition"
                  >
                    Scan QR
                  </button>
                </div>
              </div>
            </Field>

            <Field label="Card color">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {CARD_COLOR_PRESETS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColor(hex)}
                      className="flex h-9 w-9 items-center justify-center rounded-full ring-2 transition hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: hex,
                        borderColor: "transparent",
                        outline: color === hex ? "2px solid white" : "none",
                        outlineOffset: 2,
                      }}
                      aria-label={`Choose color ${hex}`}
                    />
                  ))}

                  {/* Custom Color Wheel Button */}
                  <label
                    className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition hover:scale-105 active:scale-95 shadow-md"
                    style={{
                      background:
                        "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                      outline: !CARD_COLOR_PRESETS.includes(color) ? "2px solid white" : "none",
                      outlineOffset: 2,
                    }}
                    title="Custom Color Wheel"
                  >
                    <input
                      type="color"
                      value={color.startsWith("#") && color.length === 7 ? color : "#1e3a8a"}
                      onChange={(e) => setColor(e.target.value)}
                      className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                    />
                    <div className="h-3 w-3 rounded-full bg-white/90 border border-black/30 pointer-events-none shadow-sm" />
                  </label>
                </div>

                {/* Hex Code Input */}
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-white/20 shadow-inner"
                    style={{ backgroundColor: color }}
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => {
                      const val = e.target.value;
                      setColor(val.startsWith("#") ? val : `#${val}`);
                    }}
                    placeholder="#HEX color"
                    maxLength={7}
                    className="w-32 rounded-xl bg-white/[0.06] px-3 py-1.5 text-[13px] font-mono text-white outline-none ring-1 ring-white/[0.08] focus:ring-white/25"
                  />
                  <span className="text-[12px] text-white/50">Custom Hex Code</span>
                </div>
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
          </div>
        </div>
      </form>

      {/* QR Scanner Camera Modal Overlay */}
      {showQRScanner && (
        <QRScannerModal
          onScan={(scannedVal) => {
            setQrCodeData(scannedVal);
            setShowQRScanner(false);
          }}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
}
