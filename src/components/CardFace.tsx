"use client";

import { useState, useRef } from "react";
import { brandTheme, customGradient, formatExpiryDisplay, isLightBackground, maskCardNumber } from "@/lib/cardUtils";
import type { WalletCard } from "@/lib/types";
import { CardChip, ContactlessIcon, NetworkBrandLogo } from "./BrandLogos";
import QRCodeDisplay from "./QRCodeDisplay";

interface CardFaceProps {
  card: WalletCard;
  size?: "peek" | "full";
  style?: React.CSSProperties;
  className?: string;
  interactiveGlare?: boolean;
}

export default function CardFace({
  card,
  size = "full",
  style,
  className = "",
  interactiveGlare = true,
}: CardFaceProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const theme = brandTheme(card.brand);
  const background = card.color ? customGradient(card.color) : theme.gradient;
  const isLight = isLightBackground(background);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveGlare || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePos({ x, y, opacity: 0.22 });
  };

  const handleMouseLeave = () => {
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`apple-card-surface group relative w-full aspect-[1.586/1] overflow-hidden rounded-[20px] select-none ${
        isLight ? "text-slate-950" : "text-white"
      } ${className}`}
      style={{ background, ...style }}
    >
      {/* Card Custom Face Image Background Layer */}
      {card.cardImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.cardImage}
            alt={card.label}
            className="absolute inset-0 z-0 h-full w-full object-cover"
          />
          {/* Gradient readability shadow overlay */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/85 via-black/35 to-black/50 pointer-events-none" />
        </>
      ) : null}

      {/* Specular glare glass reflection overlay */}
      <div className="apple-card-glare" />

      {/* Dynamic Cursor/Touch Reflection Glare */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: glarePos.opacity,
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 65%)`,
        }}
      />

      {/* Card Contents Container */}
      <div className="relative z-20 flex h-full flex-col justify-between p-5">
        {/* Top Header: Card Label, Card Type Badge / Bank Name & Contactless Symbol */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p
                className={`truncate text-[15px] font-bold tracking-tight ${
                  card.cardImage ? "text-white" : isLight ? "text-slate-950" : "text-white"
                }`}
              >
                {card.label}
              </p>
              {/* Card Type Badge visible at top when stacked */}
              <span
                className={`inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase border ${
                  card.cardImage
                    ? "bg-white/20 text-white border-white/30"
                    : isLight
                    ? "bg-slate-900/10 text-slate-950 border-slate-900/20"
                    : "bg-white/20 text-white border-white/25 shadow-sm"
                }`}
              >
                {card.category.toUpperCase()}
              </span>
            </div>

            {card.bankName ? (
              <p
                className={`truncate text-[11px] font-semibold tracking-wider uppercase mt-0.5 ${
                  card.cardImage ? "text-white/80" : isLight ? "text-slate-800/80" : "text-white/70"
                }`}
              >
                {card.bankName}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center pt-0.5">
            <ContactlessIcon
              className={`h-5 w-5 rotate-90 ${
                card.cardImage ? "text-white/90" : isLight ? "text-slate-900/90" : "text-white/90"
              }`}
            />
          </div>
        </div>

        {/* Middle Section: Metallic Chip & Pass QR Code Preview */}
        <div className="my-auto flex items-center justify-between pt-1">
          <CardChip className="h-7 w-9" />
          {card.qrCodeData ? (
            <div className="shrink-0 scale-90 opacity-90 transition-transform group-hover:scale-100">
              <QRCodeDisplay value={card.qrCodeData} size={42} className="p-1 rounded-lg" />
            </div>
          ) : null}
        </div>

        {/* Bottom Section: Masked Number, Cardholder, Expiry, Brand Logo */}
        <div className="mt-auto">
          <p
            className={`tabular-nums font-mono text-[17px] font-semibold tracking-[0.14em] drop-shadow-sm ${
              isLight ? "text-slate-950" : "text-white"
            }`}
          >
            {maskCardNumber(card.number, card.brand)}
          </p>

          <div className="mt-2.5 flex items-end justify-between gap-2">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex flex-col min-w-0">
                <span
                  className={`truncate text-[9px] font-bold uppercase tracking-widest ${
                    isLight ? "text-slate-800/70" : "text-white/60"
                  }`}
                >
                  CARDHOLDER
                </span>
                <span
                  className={`truncate text-[11px] font-bold uppercase tracking-wider ${
                    isLight ? "text-slate-950" : "text-white"
                  }`}
                >
                  {card.holder || "CARD HOLDER"}
                </span>
              </div>

              {formatExpiryDisplay(card.expiryMonth, card.expiryYear) ? (
                <div className="flex flex-col shrink-0">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-widest ${
                      isLight ? "text-slate-800/70" : "text-white/60"
                    }`}
                  >
                    EXPIRES
                  </span>
                  <span
                    className={`tabular-nums text-[11px] font-bold tracking-wider ${
                      isLight ? "text-slate-950" : "text-white"
                    }`}
                  >
                    {formatExpiryDisplay(card.expiryMonth, card.expiryYear)}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center pb-0.5">
              <NetworkBrandLogo brand={card.brand} isLight={isLight} className="h-5 w-auto drop-shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
