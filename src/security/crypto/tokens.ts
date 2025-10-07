/**
 * @file tokens implementation
 */

/**
 * Token Generation Utilities
 * Functions for generating secure tokens and nonces
 */

import { generateSecureHex } from "./random";
import { constantTimeCompare } from "./comparison";

/**
 * Generate a secure nonce for CSP
 * @example
 */
export function generateNonce(): string {
  return generateSecureHex(32);
}

/**
 * Generate a secure CSRF token
 * @example
 */
export function generateCSRFToken(): string {
  return generateSecureHex(64);
}

/**
 * Validate CSRF token with constant-time comparison
 * @param token
 * @param expectedToken
 * @example
 */
export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (!token && !expectedToken) {
    return true; // Both empty strings are equal
  }
  if (!token || !expectedToken) {
    return false;
  }
  return constantTimeCompare(token, expectedToken);
}

/**
 * Generate a secure session ID
 * @example
 */
export function generateSessionID(): string {
  return generateSecureHex(128);
}

/**
 * Generate a secure API key
 * @param prefix
 * @example
 */
export function generateAPIKey(prefix: string = "rk"): string {
  const randomPart = generateSecureHex(64);
  return `${prefix}_${randomPart}`;
}

/**
 * Generate a secure password reset token
 * @example
 */
export function generatePasswordResetToken(): string {
  return generateSecureHex(64);
}

/**
 * Generate a secure email verification token
 * @example
 */
export function generateEmailVerificationToken(): string {
  return generateSecureHex(64);
}
