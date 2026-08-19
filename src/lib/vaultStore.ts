import { kvClearAll, kvDelete, kvGet, kvSet } from "./db";
import {
  PBKDF2_ITERATIONS,
  checkVerifier,
  createVerifier,
  decryptJSON,
  deriveKey,
  encryptJSON,
  randomBytesBase64,
} from "./crypto";
import type { EncryptedBlob, VaultBackup, VaultMeta, WalletCard } from "./types";

const META_KEY = "vaultMeta";
const DATA_KEY = "vaultData";

export const DEFAULT_AUTO_LOCK_MINUTES = 5;

export async function getVaultMeta(): Promise<VaultMeta | undefined> {
  return kvGet<VaultMeta>(META_KEY);
}

export async function vaultExists(): Promise<boolean> {
  return (await getVaultMeta()) !== undefined;
}

/** First-run setup: choose a PIN, create an empty encrypted vault. */
export async function createVault(pin: string): Promise<CryptoKey> {
  const salt = randomBytesBase64(16);
  const key = await deriveKey(pin, salt, PBKDF2_ITERATIONS);
  const verifier = await createVerifier(key);
  const meta: VaultMeta = {
    version: 1,
    salt,
    iterations: PBKDF2_ITERATIONS,
    verifierIv: verifier.iv,
    verifierCiphertext: verifier.ciphertext,
    autoLockMinutes: DEFAULT_AUTO_LOCK_MINUTES,
    createdAt: Date.now(),
  };
  const emptyBlob = await encryptJSON<WalletCard[]>(key, []);
  await kvSet(META_KEY, meta);
  await kvSet<EncryptedBlob>(DATA_KEY, emptyBlob);
  return key;
}

export interface UnlockResult {
  key: CryptoKey;
  cards: WalletCard[];
}

/** Returns undefined if the PIN is wrong. Throws only on unexpected I/O errors. */
export async function unlockVault(pin: string): Promise<UnlockResult | undefined> {
  const meta = await getVaultMeta();
  if (!meta) throw new Error("No vault has been created yet.");
  const key = await deriveKey(pin, meta.salt, meta.iterations);
  const ok = await checkVerifier(key, { iv: meta.verifierIv, ciphertext: meta.verifierCiphertext });
  if (!ok) return undefined;
  const blob = await kvGet<EncryptedBlob>(DATA_KEY);
  const cards = blob ? await decryptJSON<WalletCard[]>(key, blob) : [];
  return { key, cards };
}

export async function persistCards(key: CryptoKey, cards: WalletCard[]): Promise<void> {
  const blob = await encryptJSON<WalletCard[]>(key, cards);
  await kvSet<EncryptedBlob>(DATA_KEY, blob);
}

export async function changePin(
  currentKey: CryptoKey,
  cards: WalletCard[],
  newPin: string,
  autoLockMinutes: number
): Promise<CryptoKey> {
  const salt = randomBytesBase64(16);
  const newKey = await deriveKey(newPin, salt, PBKDF2_ITERATIONS);
  const verifier = await createVerifier(newKey);
  const meta: VaultMeta = {
    version: 1,
    salt,
    iterations: PBKDF2_ITERATIONS,
    verifierIv: verifier.iv,
    verifierCiphertext: verifier.ciphertext,
    autoLockMinutes,
    createdAt: (await getVaultMeta())?.createdAt ?? Date.now(),
  };
  await kvSet(META_KEY, meta);
  await persistCards(newKey, cards);
  return newKey;
}

export async function updateAutoLockMinutes(minutes: number): Promise<void> {
  const meta = await getVaultMeta();
  if (!meta) return;
  await kvSet<VaultMeta>(META_KEY, { ...meta, autoLockMinutes: minutes });
}

/** Irreversibly wipes everything stored on this device. */
export async function destroyVault(): Promise<void> {
  await kvDelete(META_KEY);
  await kvDelete(DATA_KEY);
  await kvClearAll();
}

export async function exportEncryptedBackup(): Promise<VaultBackup> {
  const meta = await getVaultMeta();
  const data = await kvGet<EncryptedBlob>(DATA_KEY);
  if (!meta || !data) throw new Error("Nothing to export yet.");
  return {
    app: "wallet-app-backup",
    version: 1,
    exportedAt: Date.now(),
    meta,
    data,
  };
}

/** Overwrites the local vault with a previously exported encrypted backup. */
export async function importEncryptedBackup(backup: VaultBackup): Promise<void> {
  if (backup.app !== "wallet-app-backup" || !backup.meta || !backup.data) {
    throw new Error("This doesn't look like a valid Wallet backup file.");
  }
  await kvSet(META_KEY, backup.meta);
  await kvSet(DATA_KEY, backup.data);
}
