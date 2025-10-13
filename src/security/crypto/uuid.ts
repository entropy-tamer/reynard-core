/**
 * @file uuid implementation
 */

/**
 * UUID Generation Utilities
 * Functions for generating secure UUIDs
 */

import { generateSecureBytes } from "./random";

/**
 * Generate a secure UUID v4
 * 
 * NOTE: This is for client-side use only. Database primary keys now use integer IDs
 * with UUID public_id for external API compatibility and optimal performance.
 * 
 * @example
 */
export function generateSecureUUID(): string {
  const bytes = generateSecureBytes(16);

  // Set version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");

  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32),
  ].join("-");
}
