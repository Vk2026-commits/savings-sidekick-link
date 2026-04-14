/**
 * Client-side encryption for the Digital Access Vault using WebCrypto API.
 * Secrets are encrypted in the browser; only ciphertext is stored in the database.
 * If the vault passphrase is lost, secrets CANNOT be recovered.
 */

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase) as any,
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as any, iterations: 600000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptSecret(
  plaintext: string,
  passphrase: string
): Promise<{ ciphertext: string; iv: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
  };
}

export async function decryptSecret(
  ciphertext: string,
  iv: string,
  salt: string,
  passphrase: string
): Promise<string> {
  const saltBytes = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const dataBytes = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const key = await deriveKey(passphrase, saltBytes);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    dataBytes
  );
  return new TextDecoder().decode(decrypted);
}
