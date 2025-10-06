/**
 * Basic Validation Utilities
 * Simple validation functions for common data types
 */

/**
 * Username validation
 */
export function isValidUsername(username: string): boolean {
  // 3-20 characters, alphanumeric and underscores only, cannot start with number
  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
  return usernameRegex.test(username);
}

/**
 * Hexadecimal color validation
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

/**
 * IP address validation (IPv4 and IPv6)
 */
export function isValidIPAddress(ip: string): boolean {
  // IPv4 pattern
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // IPv6 pattern (simplified)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Numeric range validation
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * String length validation
 */
export function isValidLength(
  str: string,
  minLength: number = 0,
  maxLength: number = Number.MAX_SAFE_INTEGER
): boolean {
  return str.length >= minLength && str.length <= maxLength;
}

/**
 * Required field validation
 */
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}
