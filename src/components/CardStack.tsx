"use client";

import { useState } from "react";
import type { WalletCard } from "@/lib/types";
import CardFace from "./CardFace";
import { PlusIcon } from "./icons";

const PEEK_OFFSET_COLLAPSED = 74;
const PEEK_OFFSET_EXPANDED = 190;

interface CardStackProps {
  cards: WalletCard[];
  onSelect: (card: WalletCard) => void;
  onAdd: () => void;
}

export default function CardStack({ cards, onSelect, onAdd }: CardStackProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  if (cards.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200/60 dark:bg-gradient-to-tr dark:from-white/10 dark:to-white/5 ring-1 ring-slate-300 dark:ring-white/15 shadow-2xl">
          <PlusIcon className="h-9 w-9 text-slate-700 dark:text-white/70" />
        </div>
        <div>
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">No cards in Wallet</h2>
          <p className="mx-auto mt-1.5 max-w-[260px] text-[14px] text-slate-600 dark:text-white/50 leading-relaxed">
            Add your credit, debit, or loyalty cards. All data is encrypted locally on your device.
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="mt-3 rounded-full bg-slate-900 dark:bg-white px-6 py-3 text-[15px] font-semibold text-white dark:text-slate-950 shadow-lg active:scale-95 transition-transform"
        >
          Add your first card
        </button>
      </div>
    );
  }

  // Single card layout
  if (cards.length === 1) {
    const singleCard = cards[0];
    return (
      <div className="px-4 py-4 max-w-md mx-auto animate-pop-in">
        <button
          type="button"
          onClick={() => onSelect(singleCard)}
          className="block w-full text-left transition-transform duration-300 active:scale-[0.98]"
        >
          <CardFace card={singleCard} size="full" />
        </button>
      </div>
    );
  }

  const peekOffset = isExpanded ? PEEK_OFFSET_EXPANDED : PEEK_OFFSET_COLLAPSED;

  return (
    <div className="relative px-4 pb-48 pt-2 max-w-md mx-auto">
      {/* Header controls for Stack View */}
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-[12px] font-bold uppercase tracking-wider text-slate-500 dark:text-white/40">
          {cards.length} {cards.length === 1 ? "card" : "cards"}
        </p>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="rounded-full bg-slate-200/80 dark:bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold text-slate-800 dark:text-white/80 hover:bg-slate-300 dark:hover:bg-white/15 active:scale-95 transition"
        >
          {isExpanded ? "Collapse Stack" : "Fan Out Cards"}
        </button>
      </div>

      {/* Stack of Full Physical Cards */}
      <div
        className="relative transition-all duration-500 ease-out"
        style={{
          height: `${(cards.length - 1) * peekOffset + 220}px`,
        }}
      >
        {cards.map((card, index) => {
          const isTopActive = activeCardId === card.id;
          const topPos = index * peekOffset;

          return (
            <div
              key={card.id}
              className="absolute left-0 right-0 transition-all duration-500"
              style={{
                top: `${topPos}px`,
                zIndex: isTopActive ? 50 : index + 1,
                transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
              }}
            >
              <button
                type="button"
                onClick={() => onSelect(card)}
                onMouseEnter={() => setActiveCardId(card.id)}
                onMouseLeave={() => setActiveCardId(null)}
                className="group block w-full text-left transition-transform duration-300 active:scale-[0.985] focus:outline-none"
              >
                <div
                  className={`transform transition-all duration-300 ${
                    isTopActive ? "-translate-y-3 scale-[1.01]" : "group-hover:-translate-y-2"
                  }`}
                >
                  <CardFace
                    card={card}
                    size="full"
                    className="shadow-[0_-10px_28px_rgba(0,0,0,0.65)] ring-1 ring-white/10"
                  />
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
