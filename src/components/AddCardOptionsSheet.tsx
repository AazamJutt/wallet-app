"use client";

import type { CardCategory } from "@/lib/types";
import { ContactlessIcon } from "./BrandLogos";
import { PlusIcon, XIcon } from "./icons";

interface AddCardOptionsSheetProps {
  onSelectOption: (option: "nfc" | "qr" | CardCategory) => void;
  onClose: () => void;
}

export default function AddCardOptionsSheet({
  onSelectOption,
  onClose,
}: AddCardOptionsSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-fade-in safe-bottom">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-t-[32px] bg-slate-900 ring-1 ring-white/15 shadow-2xl animate-sheet-in p-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div>
            <h3 className="text-[20px] font-bold text-white tracking-tight">Add to Wallet</h3>
            <p className="text-[13px] text-white/50">Choose what type of item you want to add</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 active:scale-95 transition"
            aria-label="Close"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="mt-2 flex flex-col gap-2.5">
          {/* Option 1: Credit or Debit Card */}
          <button
            type="button"
            onClick={() => onSelectOption("nfc")}
            className="group flex items-center gap-4 rounded-2xl bg-white/[0.06] p-4 text-left ring-1 ring-white/10 hover:bg-white/10 active:scale-[0.98] transition"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
              <ContactlessIcon className="h-6 w-6 rotate-90" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-white group-hover:text-emerald-400 transition-colors">
                Credit or Debit Card
              </p>
              <p className="text-[12px] text-white/50 truncate">
                Scan via NFC or add Visa, Mastercard, Amex
              </p>
            </div>
          </button>

          {/* Option 2: Boarding Pass & Tickets */}
          <button
            type="button"
            onClick={() => onSelectOption("qr")}
            className="group flex items-center gap-4 rounded-2xl bg-white/[0.06] p-4 text-left ring-1 ring-white/10 hover:bg-white/10 active:scale-[0.98] transition"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <path d="M7 8h10M7 12h6M7 16h4" />
                <circle cx="17" cy="15" r="2" fill="currentColor" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-white group-hover:text-emerald-400 transition-colors">
                Boarding Pass & Tickets
              </p>
              <p className="text-[12px] text-white/50 truncate">
                Scan QR code for flight, transit, & event passes
              </p>
            </div>
          </button>

          {/* Option 3: ID Card & Driver's License */}
          <button
            type="button"
            onClick={() => onSelectOption("id")}
            className="group flex items-center gap-4 rounded-2xl bg-white/[0.06] p-4 text-left ring-1 ring-white/10 hover:bg-white/10 active:scale-[0.98] transition"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <circle cx="9" cy="10" r="2.5" />
                <path d="M5 17c0-2 2-3 4-3s4 1 4 3M15 9h4M15 13h3" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-white group-hover:text-emerald-400 transition-colors">
                ID Card & Driver&apos;s License
              </p>
              <p className="text-[12px] text-white/50 truncate">
                Add photo ID, student card, or membership photo
              </p>
            </div>
          </button>

          {/* Option 4: Other Cards & Loyalty */}
          <button
            type="button"
            onClick={() => onSelectOption("other")}
            className="group flex items-center gap-4 rounded-2xl bg-white/[0.06] p-4 text-left ring-1 ring-white/10 hover:bg-white/10 active:scale-[0.98] transition"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <PlusIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-white group-hover:text-emerald-400 transition-colors">
                Other Cards & Rewards
              </p>
              <p className="text-[12px] text-white/50 truncate">
                Store cards, rewards, library cards, & custom cards
              </p>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-2xl bg-white/10 py-3 text-[14px] font-semibold text-white/80 active:scale-95 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
