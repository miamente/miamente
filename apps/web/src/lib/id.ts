let inProcessCounter = 0;

/**
 * Generates cryptographically secure random bytes
 */
function getSecureRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

/**
 * Converts random bytes to base36 string
 */
function bytesToBase36(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(36)).join("");
}

export function generateUniqueId(): string {
  inProcessCounter = (inProcessCounter + 1) % 1_000_000;
  const timestampPart = Date.now().toString(36);
  const randomBytes = getSecureRandomBytes(12); // 12 bytes = ~64 bits of entropy
  const randomPart = bytesToBase36(randomBytes).slice(0, 16);
  const counterPart = inProcessCounter.toString(36).padStart(4, "0");
  return `${timestampPart}-${randomPart}-${counterPart}`;
}

/**
 * Converts random bytes to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function generateUniqueIdHex(length: number = 32): string {
  inProcessCounter = (inProcessCounter + 1) % 1_000_000;
  const tsHex = Date.now().toString(16);
  const randomBytes = getSecureRandomBytes(8); // 8 bytes = 64 bits of entropy
  const randomHex = bytesToHex(randomBytes);
  const base = `${tsHex}${randomHex}${inProcessCounter.toString(16).padStart(4, "0")}`;
  return base.slice(0, length);
}
