import type { CardBrand } from "./types";

/** Strips everything but digits. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Standard Luhn checksum used by every major card network. */
export function luhnCheck(numberDigitsOnly: string): boolean {
  const digits = onlyDigits(numberDigitsOnly);
  if (digits.length < 8) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

interface BrandRule {
  brand: CardBrand;
  pattern: RegExp;
}

// Ordered so more specific prefixes are checked before broader ones.
const BRAND_RULES: BrandRule[] = [
  { brand: "amex", pattern: /^3[47]/ },
  { brand: "diners", pattern: /^3(?:0[0-5]|[68][0-9])/ },
  { brand: "jcb", pattern: /^35(?:2[89]|[3-8][0-9])/ },
  { brand: "discover", pattern: /^(?:6011|65|64[4-9]|622(?:1[2-9]|[2-8][0-9]|9[01]|92))/ },
  { brand: "unionpay", pattern: /^62/ },
  { brand: "maestro", pattern: /^(?:5[06-9]|6)/ },
  { brand: "mastercard", pattern: /^(?:5[1-5]|2(?:2[2-9]|[3-6][0-9]|7[01]|720))/ },
  { brand: "visa", pattern: /^4/ },
];

export function detectBrand(numberDigitsOnly: string): CardBrand {
  const digits = onlyDigits(numberDigitsOnly);
  if (!digits) return "unknown";
  for (const rule of BRAND_RULES) {
    if (rule.pattern.test(digits)) return rule.brand;
  }
  return "unknown";
}

export function brandLabel(brand: CardBrand): string {
  switch (brand) {
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    case "amex":
      return "American Express";
    case "discover":
      return "Discover";
    case "diners":
      return "Diners Club";
    case "jcb":
      return "JCB";
    case "unionpay":
      return "UnionPay";
    case "maestro":
      return "Maestro";
    default:
      return "Card";
  }
}

/** Amex uses 4-6-5 grouping; everything else groups in 4s. */
export function formatCardNumber(numberDigitsOnly: string, brand?: CardBrand): string {
  const digits = onlyDigits(numberDigitsOnly);
  const detected = brand ?? detectBrand(digits);
  if (detected === "amex") {
    const parts = [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)].filter(Boolean);
    return parts.join(" ");
  }
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function maskCardNumber(numberDigitsOnly: string, brand?: CardBrand): string {
  const digits = onlyDigits(numberDigitsOnly);
  if (digits.length < 4) return formatCardNumber(digits, brand);
  const last4 = digits.slice(-4);
  const detected = brand ?? detectBrand(digits);
  if (detected === "amex") {
    return `•••• •••••• ${last4}`;
  }
  return `•••• •••• •••• ${last4}`;
}

export function last4(numberDigitsOnly: string): string {
  const digits = onlyDigits(numberDigitsOnly);
  return digits.slice(-4);
}

export function maxLengthForBrand(brand: CardBrand): number {
  if (brand === "amex") return 15;
  if (brand === "diners") return 14;
  return 16;
}

export function cvvLengthForBrand(brand: CardBrand): number {
  return brand === "amex" ? 4 : 3;
}

/** Formats raw digit or slash input into "MM/YY" as the user types. */
export function formatExpiryInput(raw: string): string {
  const clean = raw.trim();
  const digits = onlyDigits(clean).slice(0, 4);

  if (digits.length === 0) return "";

  // Auto-prepend '0' if the first typed digit is between 2 and 9 (e.g. '8' -> '08/')
  if (digits.length === 1 && parseInt(digits[0], 10) >= 2) {
    return `0${digits}/`;
  }

  if (digits.length === 1) {
    return digits;
  }

  if (digits.length === 2) {
    return `${digits}/`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function isExpiryValid(month: string, year: string): boolean {
  const m = parseInt(month, 10);
  const y = parseInt(year.length === 2 ? `20${year}` : year, 10);
  if (!m || m < 1 || m > 12 || !y) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (y < currentYear) return false;
  if (y === currentYear && m < currentMonth) return false;
  return true;
}

export function hasExpiry(month: string, year: string): boolean {
  return Boolean(month && year && month !== "00" && year !== "00");
}

/** Cards with no expiry set (loyalty/gift/ID cards) are never "expired". */
export function isCardExpired(month: string, year: string): boolean {
  if (!hasExpiry(month, year)) return false;
  return !isExpiryValid(month, year);
}

export function formatExpiryDisplay(month: string, year: string): string {
  if (!hasExpiry(month, year)) return "";
  const mm = month.padStart(2, "0");
  const yy = year.length === 4 ? year.slice(2) : year.padStart(2, "0");
  return `${mm}/${yy}`;
}

interface BrandTheme {
  gradient: string; // CSS gradient
  textClass: string;
  isLight?: boolean;
}

const BRAND_THEME: Record<CardBrand, BrandTheme> = {
  visa: {
    gradient: "linear-gradient(135deg, #0d1b3e 0%, #1a365d 40%, #2b6cb0 100%)",
    textClass: "text-white",
  },
  mastercard: {
    gradient: "linear-gradient(135deg, #111118 0%, #1f2029 50%, #2d2e3e 100%)",
    textClass: "text-white",
  },
  amex: {
    gradient: "linear-gradient(135deg, #00529b 0%, #0077c5 50%, #00a8e8 100%)",
    textClass: "text-white",
  },
  discover: {
    gradient: "linear-gradient(135deg, #a33b00 0%, #d95d00 50%, #ff8c00 100%)",
    textClass: "text-white",
  },
  diners: {
    gradient: "linear-gradient(135deg, #0a2540 0%, #143d66 60%, #20639b 100%)",
    textClass: "text-white",
  },
  jcb: {
    gradient: "linear-gradient(135deg, #063d27 0%, #0d633e 50%, #159c62 100%)",
    textClass: "text-white",
  },
  unionpay: {
    gradient: "linear-gradient(135deg, #5c0f16 0%, #941b24 50%, #d02c3a 100%)",
    textClass: "text-white",
  },
  maestro: {
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    textClass: "text-white",
  },
  unknown: {
    gradient: "linear-gradient(135deg, #1e202a 0%, #2a2d3d 50%, #171822 100%)",
    textClass: "text-white",
    isLight: false,
  },
};

export function brandTheme(brand: CardBrand): BrandTheme {
  return BRAND_THEME[brand] ?? BRAND_THEME.unknown;
}

/** Determines if a color (hex, rgb, or gradient string) is visually light */
export function isLightBackground(colorOrGradient: string): boolean {
  if (!colorOrGradient) return false;
  const hexMatches = colorOrGradient.match(/#([0-9a-fA-F]{3,8})/g);
  if (hexMatches && hexMatches.length > 0) {
    let totalLuminance = 0;
    for (const hex of hexMatches) {
      totalLuminance += getHexLuminance(hex);
    }
    const avgLuminance = totalLuminance / hexMatches.length;
    return avgLuminance > 165;
  }
  return false;
}

function getHexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const fullHex = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(fullHex, 16);
  if (isNaN(num)) return 0;
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** A curated palette users can pick from for custom card colors. */
export const CARD_COLOR_PRESETS: string[] = [
  "#0b0c10", // Titanium Black
  "#1f2937", // Charcoal Gray
  "#1e3a8a", // Sapphire Blue
  "#064e3b", // Emerald Green
  "#581c87", // Amethyst Purple
  "#881337", // Crimson Ruby
  "#78350f", // Champagne Gold
  "#0f766e", // Teal Ocean
  "#312e81", // Deep Indigo
  "#e5e7eb", // Platinum Silver (light)
];

export function customGradient(hex: string): string {
  return `linear-gradient(135deg, ${hex} 0%, ${shade(hex, -28)} 100%)`;
}

function shade(hex: string, percent: number): string {
  const clean = hex.replace("#", "");
  const num = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  const amt = Math.round((percent / 100) * 255);
  r = Math.min(255, Math.max(0, r + amt));
  g = Math.min(255, Math.max(0, g + amt));
  b = Math.min(255, Math.max(0, b + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
