/**
 * @file comparison implementation
 */

/**
 * Comparison Utilities
 * Functions for secure comparison operations
 */

/**
 * Constant-time string comparison to prevent timing attacks
 * @param a
 * @param b
 * @example
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
