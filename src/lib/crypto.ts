/**
 * All encryption happens client-side with the browser's native Web Crypto
 * API (SubtleCrypto). Nothing here ever calls the network. A PIN/passphrase
 * is stretched into an AES-256 key with PBKDF2; that key only ever lives in
 * memory for the current unlocked session and is never itself stored.
 */

export const PBKDF2_ITERATIONS = 210_000;
const VERIFIER_PLAINTEXT = "wallet-app-vault-ok";

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < arr.byteLength; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function randomBytesBase64(length: number): string {
  return toBase64(randomBytes(length));
}

async function importPinKey(pin: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey("raw", encoder.encode(pin), { name: "PBKDF2" }, false, [
    "deriveKey",
  ]);
}

export async function deriveKey(
  pin: string,
  saltB64: string,
  iterations: number = PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  const keyMaterial = await importPinKey(pin);
  const salt = fromBase64(saltB64) as unknown as BufferSource;
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export interface EncryptedPayload {
  iv: string;
  ciphertext: string;
}

export async function encryptString(key: CryptoKey, plaintext: string): Promise<EncryptedPayload> {
  const iv = randomBytes(12);
  const encoder = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    key,
    encoder.encode(plaintext) as unknown as BufferSource
  );
  return { iv: toBase64(iv), ciphertext: toBase64(ciphertext) };
}

export async function decryptString(key: CryptoKey, payload: EncryptedPayload): Promise<string> {
  const iv = fromBase64(payload.iv) as unknown as BufferSource;
  const ciphertext = fromBase64(payload.ciphertext) as unknown as BufferSource;
  const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(plainBuffer);
}

export async function encryptJSON<T>(key: CryptoKey, data: T): Promise<EncryptedPayload> {
  return encryptString(key, JSON.stringify(data));
}

export async function decryptJSON<T>(key: CryptoKey, payload: EncryptedPayload): Promise<T> {
  const text = await decryptString(key, payload);
  return JSON.parse(text) as T;
}

/** Creates a verifier blob so we can confirm a PIN is correct without ever storing the PIN. */
export async function createVerifier(key: CryptoKey): Promise<EncryptedPayload> {
  return encryptString(key, VERIFIER_PLAINTEXT);
}

export async function checkVerifier(key: CryptoKey, payload: EncryptedPayload): Promise<boolean> {
  try {
    const text = await decryptString(key, payload);
    return text === VERIFIER_PLAINTEXT;
  } catch {
    // AES-GCM throws on tampered/incorrect-key ciphertext — that's our "wrong PIN" signal.
    return false;
  }
}
