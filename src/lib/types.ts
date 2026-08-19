export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "diners"
  | "jcb"
  | "unionpay"
  | "maestro"
  | "unknown";

export type CardCategory = "credit" | "debit" | "prepaid" | "loyalty" | "gift" | "id" | "other";

export interface WalletCard {
  id: string;
  label: string;
  holder: string;
  /** Digits only. Decrypted value only ever lives in memory. */
  number: string;
  /** Two digit month, "01"-"12" */
  expiryMonth: string;
  /** Two digit year, e.g. "29" for 2029 */
  expiryYear: string;
  /** Optional — omit if you'd rather not store it at all. */
  cvv?: string;
  brand: CardBrand;
  category: CardCategory;
  bankName?: string;
  /** Hex color used to theme the card face, e.g. "#1d4ed8" */
  color: string;
  notes?: string;
  pinned?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type WalletCardDraft = Omit<WalletCard, "id" | "createdAt" | "updatedAt">;

export interface VaultMeta {
  version: 1;
  /** base64 */
  salt: string;
  iterations: number;
  /** base64 */
  verifierIv: string;
  /** base64 */
  verifierCiphertext: string;
  autoLockMinutes: number;
  createdAt: number;
}

export interface EncryptedBlob {
  /** base64 */
  iv: string;
  /** base64 */
  ciphertext: string;
}

export interface VaultBackup {
  app: "wallet-app-backup";
  version: 1;
  exportedAt: number;
  meta: VaultMeta;
  data: EncryptedBlob;
}
