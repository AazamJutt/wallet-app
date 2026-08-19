"use client";

import type { SVGProps } from "react";
import type { CardBrand } from "@/lib/types";

type IconProps = SVGProps<SVGSVGElement>;

/**
 * High quality metallic EMV chip with etched circuits, gradient fill, and 3D bevel effect
 */
export function CardChip({ className = "h-7 w-9" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[5px] p-[1px] shadow-md ${className}`}>
      {/* Metallic base gradient */}
      <div className="h-full w-full rounded-[4px] bg-gradient-to-br from-[#ffe082] via-[#ffb300] to-[#c79100] p-[1px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(0,0,0,0.4)]">
        <div className="relative h-full w-full rounded-[3px] bg-gradient-to-b from-[#fada5e] via-[#d4af37] to-[#aa7c11] overflow-hidden">
          {/* Etched circuit lines */}
          <svg viewBox="0 0 36 28" fill="none" className="h-full w-full opacity-80">
            <rect x="0" y="0" width="36" height="28" fill="url(#chip-gold)" />
            {/* Outer border cutouts & contact pads */}
            <path d="M12 0v28M24 0v28M0 9.5h36M0 18.5h36" stroke="#4a3600" strokeWidth="0.9" />
            <path d="M12 9.5h12v9.5H12z" fill="#cfa125" stroke="#4a3600" strokeWidth="0.9" />
            <path d="M12 14h12" stroke="#4a3600" strokeWidth="0.8" />
            {/* Specular pad highlights */}
            <path d="M0 1h36M0 10h36M0 19h36" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.6" />
            <defs>
              <linearGradient id="chip-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff2a8" />
                <stop offset="40%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#996515" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}

export function ContactlessIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" {...props}>
      <path d="M7 16.5a7 7 0 0 1 0-9" opacity="0.95" />
      <path d="M11 18.5a10 10 0 0 1 0-13" opacity="0.8" />
      <path d="M15 20.5a13 13 0 0 1 0-17" opacity="0.65" />
      <path d="M19 22.5a16 16 0 0 1 0-21" opacity="0.4" />
    </svg>
  );
}

/** Official Visa SVG Logo */
export function VisaLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 100 32" fill="currentColor" {...props}>
      <path d="M38.8 28.5L44.5 3.5h7.2l-5.7 25h-7.2zm29.1-24.5c-1.4 0-3.6.5-4.8 2.8l-10 21.7h7.6l1.5-4.2h9.3l0.9 4.2h6.7l-5.7-24.5h-5.5zm-3.6 15l3.2-8.8c-.1.2.7-1.9.7-1.9l.4 1.9 1.8 8.8h-6.1zm-32.9-15l-7 17.5-0.8-3.7c-1.3-4.3-5.3-9-9.9-11.3l6.5 22.5h7.6l11.4-25h-7.8zm-23.7 0h-11.8l-.1.6c9.3 2.4 15.4 8.1 17.9 14.8l-2.6-13.1c-.5-1.7-1.8-2.2-3.4-2.3z" />
    </svg>
  );
}

/** Official Mastercard SVG Logo */
export function MastercardLogo({ className = "h-7 w-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 38" fill="none" className={className}>
      <circle cx="21" cy="19" r="15" fill="#EB001B" />
      <circle cx="39" cy="19" r="15" fill="#F79E1B" />
      <path
        d="M30 7.2A14.94 14.94 0 0 0 21 19c0 4.7 2.16 8.9 5.56 11.66A14.94 14.94 0 0 0 39 19a14.94 14.94 0 0 0-9-11.8z"
        fill="#FF5F00"
      />
    </svg>
  );
}

/** Official American Express SVG Logo */
export function AmexLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 60 40" fill="currentColor" {...props}>
      <rect width="60" height="40" rx="6" fill="#006FCF" />
      <path
        d="M7 25.5l2.2-5.4h2.4l2.2 5.4h-1.5l-.4-1.1H9.8l-.4 1.1H7.9zm2.4-2.2h1.9l-.9-2.5-.9 2.5zm5.9 2.2V14.5h2.8l1.7 6.4 1.7-6.4h2.8v11h-1.6v-8.2l-2 7.8h-1.7l-2-7.8v8.2h-1.7zm11.7 0V14.5h5.5v1.4h-3.8v3.2h3.4v1.4h-3.4v3.6h3.8v1.4h-5.5zm7.3 0l3-5.5-2.8-5.5h1.9l1.9 3.9 1.9-3.9h1.8l-2.8 5.4 3 5.6h-1.9l-2-4.1-2 4.1h-1.9z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/** Official Discover SVG Logo */
export function DiscoverLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 100 24" fill="currentColor" {...props}>
      <path d="M0 17.5V6.5h7.2c3.8 0 6.6 2.3 6.6 5.5s-2.8 5.5-6.6 5.5H0zm3.2-2.7h3.8c2 0 3.5-1.1 3.5-2.8s-1.5-2.8-3.5-2.8H3.2v5.6zM16 17.5V6.5h3.2v11H16zm15.4-.2c-3.5 0-6.1-2.4-6.1-5.5 0-3.2 2.6-5.5 6.1-5.5 2.5 0 4.6 1.2 5.6 3.2l-2.7 1.3c-.6-1-1.6-1.7-2.9-1.7-1.8 0-3.1 1.2-3.1 2.7 0 1.6 1.3 2.8 3.1 2.8 1.3 0 2.3-.7 2.9-1.7l2.7 1.3c-1 2-3.1 3.1-5.6 3.1zm11.2.2V6.5h3.2v11h-3.2zm14-11l3.5 7.8 3.5-7.8h3.7l-5.6 11h-3.3l-5.5-11h3.7zm15.2 11V6.5h9v2.7h-5.8v1.6h5.2v2.6h-5.2v1.5h6V17.5h-9.2zm12.3 0V6.5h5.8c2.2 0 3.7.9 3.7 2.5 0 1.2-.7 2-1.8 2.3l2.2 6.2h-3.4l-1.9-5.4h-1.4v5.4h-3.2zm3.2-7.8h2.3c.7 0 1.2-.4 1.2-1s-.5-1-1.2-1h-2.3v2z" />
      <circle cx="49" cy="12" r="5" fill="#FF6B00" />
    </svg>
  );
}

/** Official Apple Pay SVG Logo */
export function ApplePayLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 100 32" fill="currentColor" {...props}>
      {/* Apple Logo */}
      <path d="M12.5 12.8c-.6.7-1.5 1.2-2.4 1.1-.1-1 .3-2.1.9-2.7.6-.7 1.7-1.2 2.5-1.2.1 1.1-.4 2.1-1 2.8zm1.2 1.5c-1.4-.1-2.6.8-3.2.8-.7 0-1.7-.8-2.8-.7-1.5 0-2.8.9-3.5 2.2-1.5 2.6-.4 6.5 1 8.6.7 1.1 1.6 2.2 2.7 2.1 1.1-.1 1.5-.7 2.7-.7 1.2 0 1.6.7 2.7.7 1.1 0 1.9-1 2.6-2.1.8-1.2 1.1-2.4 1.1-2.5-.1-.1-2.2-.9-2.2-3.3 0-2.1 1.7-3.1 1.8-3.2-1-1.5-2.5-1.7-3-1.7z" />
      {/* PAY Text */}
      <path d="M25 8h4.5c2.8 0 4.8 1.6 4.8 4.2 0 2.6-2 4.2-4.8 4.2H27.5V23H25V8zm2.5 6.2h2c1.4 0 2.3-.7 2.3-2s-.9-2-2.3-2h-2v4zm15.5.3V23h-2.3v-1.8c-.7 1.3-2 2-3.6 2-2.6 0-4.3-1.8-4.3-4.2 0-2.5 1.8-4.1 4.5-4.1h3.3v-.4c0-1.3-.9-2.1-2.3-2.1-1.2 0-2.1.5-2.4 1.4l-2.1-.6c.6-1.7 2.3-2.7 4.6-2.7 2.8 0 4.5 1.4 4.5 3.7zm-2.3 2.7h-3c-1.4 0-2.3.7-2.3 1.8 0 1.1.9 1.8 2.2 1.8 1.5 0 3.1-1.1 3.1-2.5v-1.1zm14.3-3.2L50.8 26h-2.5l1.6-3.8-3.9-10.2h2.6l2.6 7.4 2.6-7.4h2.5z" />
    </svg>
  );
}

/** Render official SVG logo according to brand type */
export function NetworkBrandLogo({
  brand,
  isLight = false,
  className = "h-5 w-auto",
}: {
  brand: CardBrand;
  isLight?: boolean;
  className?: string;
}) {
  const textColorClass = isLight ? "text-slate-900" : "text-white";

  switch (brand) {
    case "visa":
      return <VisaLogo className={`${textColorClass} ${className}`} />;
    case "mastercard":
      return <MastercardLogo className={className} />;
    case "amex":
      return <AmexLogo className={className} />;
    case "discover":
      return <DiscoverLogo className={`${textColorClass} ${className}`} />;
    case "diners":
    case "jcb":
    case "unionpay":
    case "maestro":
      return (
        <span className={`text-[12px] font-bold tracking-widest uppercase italic ${isLight ? "text-slate-900/90" : "text-white/90"} ${className}`}>
          {brand}
        </span>
      );
    default:
      return <ApplePayLogo className={`${isLight ? "text-slate-900/90" : "text-white/90"} ${className}`} />;
  }
}
