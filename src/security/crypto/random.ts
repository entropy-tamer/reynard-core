/**
 * Random Generation Utilities
 * Functions for generating cryptographically secure random data
 */

/**
 * Generate cryptographically secure random bytes
 */
export function generateSecureBytes(length: number): Uint8Array {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    throw new Error("Crypto API not available");
  }

  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

/**
 * Generate cryptographically secure random string
 */
export function generateSecureString(
  length: number = 32,
  charset: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
): string {
  if (charset.length === 0) {
    return ""; // Return empty string for empty charset
  }

  try {
    const bytes = generateSecureBytes(length);
    let result = "";

    for (let i = 0; i < length; i++) {
      result += charset[bytes[i] % charset.length];
    }

    return result;
  } catch (error) {
    // Fallback to Math.random when crypto is not available
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
    return result;
  }
}

/**
 * Generate secure random hex string
 */
export function generateSecureHex(length: number = 32): string {
  const bytes = generateSecureBytes(Math.ceil(length / 2));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, length);
}

/**
 * Generate secure random base64 string
 */
export function generateSecureBase64(length: number = 32): string {
  const bytes = generateSecureBytes(length);
  return btoa(String.fromCharCode(...bytes)).substring(0, length);
}

/**
 * Secure random number between min and max (inclusive)
 */
export function secureRandomInt(min: number, max: number): number {
  if (min > max) {
    return min; // Return min value for invalid range
  }

  if (min === max) {
    return min;
  }

  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValidValue = Math.floor(256 ** bytesNeeded / range) * range - 1;

  let randomValue: number;
  do {
    const bytes = generateSecureBytes(bytesNeeded);
    randomValue = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      randomValue = (randomValue << 8) + bytes[i];
    }
  } while (randomValue > maxValidValue);

  return min + (randomValue % range);
}
