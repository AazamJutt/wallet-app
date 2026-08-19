"use client";

import { useEffect, useState } from "react";
import { ContactlessIcon } from "./BrandLogos";
import { XIcon } from "./icons";
import type { WalletCardDraft } from "@/lib/types";

interface NDEFReader {
  scan: () => Promise<void>;
  addEventListener: (
    type: string,
    listener: (event: { serialNumber?: string; message?: { records: { data?: DataView; text?: () => string }[] } }) => void
  ) => void;
}

interface NFCScannerModalProps {
  onCardScanned: (draftData?: Partial<WalletCardDraft>) => void;
  onManualEntry: () => void;
  onClose: () => void;
}

export default function NFCScannerModal({
  onCardScanned,
  onManualEntry,
  onClose,
}: NFCScannerModalProps) {
  const [nfcSupported, setNfcSupported] = useState(true);
  const [statusText, setStatusText] = useState("Ready to scan");

  useEffect(() => {
    let ndef: NDEFReader | null = null;
    let isCancelled = false;

    async function startNFCScan() {
      if (typeof window === "undefined" || !("NDEFReader" in window)) {
        setNfcSupported(false);
        setStatusText("Web NFC is unavailable on this device browser");
        return;
      }

      try {
        // @ts-expect-error Web NFC API
        const reader = new window.NDEFReader();
        ndef = reader;
        if (ndef) {
          await ndef.scan();
          setStatusText("Hold physical card against phone...");

          ndef.addEventListener("reading", (event: { serialNumber?: string; message?: { records: { data?: DataView; text?: () => string }[] } }) => {
            if (isCancelled) return;
            setStatusText("Card detected! Reading details...");

            let extractedNumber = "";
            let extractedLabel = "Contactless Card";

            if (event.message && event.message.records) {
              for (const record of event.message.records) {
                if (record.text) {
                  const text = record.text();
                  const digits = text.replace(/\D/g, "");
                  if (digits.length >= 6) {
                    extractedNumber = digits;
                  } else if (text) {
                    extractedLabel = text;
                  }
                }
              }
            }

            if (!extractedNumber && event.serialNumber) {
              extractedNumber = event.serialNumber.replace(/[^0-9]/g, "");
            }

            setTimeout(() => {
              onCardScanned({
                label: extractedLabel,
                number: extractedNumber,
                category: "credit",
              });
            }, 600);
          });

          ndef.addEventListener("readingerror", () => {
            setStatusText("Cannot read card. Try holding card closer.");
          });
        }
      } catch (err) {
        console.warn("NFC scan error:", err);
        setNfcSupported(false);
        setStatusText("Hold card near phone or enter details manually below.");
      }
    }

    startNFCScan();

    return () => {
      isCancelled = true;
    };
  }, [onCardScanned]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-end bg-black/80 backdrop-blur-md animate-fade-in p-4 safe-bottom">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] bg-slate-950 p-6 text-center shadow-2xl ring-1 ring-white/15 animate-sheet-in">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 active:scale-95 transition"
          aria-label="Close"
        >
          <XIcon className="h-5 w-5" />
        </button>

        {/* Title */}
        <h3 className="mt-2 text-[22px] font-bold text-white tracking-tight">Hold Card Near Phone</h3>
        <p className="mt-1 text-[13px] text-white/60">
          Hold your physical payment or pass card near the top back of your device.
        </p>

        {/* Apple Wallet Style Phone & Card NFC Scanning Animation */}
        <div className="relative my-8 flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-4 ring-1 ring-white/10">
          {/* Concentric Pulse Rings */}
          <div className="absolute top-6 h-28 w-28 rounded-full border border-emerald-400/40 animate-ping" />
          <div className="absolute top-8 h-20 w-20 rounded-full border-2 border-emerald-400/60 animate-pulse" />

          {/* Device Mockup */}
          <div className="relative z-10 flex h-40 w-24 flex-col items-center rounded-[22px] bg-slate-900 border-2 border-slate-700 shadow-2xl p-1.5">
            {/* Speaker notch */}
            <div className="h-1 w-6 rounded-full bg-slate-700 mb-2" />
            <div className="flex-1 w-full rounded-[14px] bg-slate-950 flex items-center justify-center">
              <ContactlessIcon className="h-8 w-8 text-emerald-400 animate-pulse rotate-90" />
            </div>
          </div>

          {/* Card Mockup Hovering above Device */}
          <div className="absolute top-4 z-20 h-20 w-32 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 shadow-2xl ring-1 ring-white/30 transform -rotate-12 animate-bounce">
            <div className="p-2 flex flex-col justify-between h-full">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-bold text-white/90">PAYMENT CARD</span>
                <ContactlessIcon className="h-3 w-3 text-white/80 rotate-90" />
              </div>
              <div className="h-2 w-3 rounded bg-amber-400/90" />
              <div className="text-[9px] font-mono text-white/90 tracking-widest">•••• 8892</div>
            </div>
          </div>
        </div>

        {/* Status text */}
        <p className="text-[13px] font-medium text-emerald-400">
          {nfcSupported ? statusText : "Ready to add card details"}
        </p>

        {/* Option to enter details manually */}
        <button
          type="button"
          onClick={onManualEntry}
          className="mt-5 w-full rounded-2xl bg-white py-3.5 text-[15px] font-bold text-slate-950 shadow-lg active:scale-95 transition-transform"
        >
          Enter Details Manually
        </button>
      </div>
    </div>
  );
}
