/**
 * String Formatting Utilities
 * Functions for formatting and manipulating strings
 */

/**
 * Truncates text to a specified length with ellipsis
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (defaults to '...')
 * @returns Truncated string
 *
 * @example
 * truncateText("Hello world!", 5) // Returns "Hello..."
 * truncateText("Hello world!", 5, "…") // Returns "Hello…"
 */
export function truncateText(text: string, maxLength: number, suffix: string = "..."): string {
  if (text.length <= maxLength) return text;
  // Truncate to maxLength, where maxLength includes the suffix
  // So we need to leave space for the suffix
  const truncatedLength = maxLength - suffix.length;
  if (truncatedLength <= 0) return suffix;
  return text.substring(0, truncatedLength) + suffix;
}

/**
 * Capitalizes the first letter of a string
 *
 * @param str - The string to capitalize
 * @returns String with first letter capitalized
 *
 * @example
 * capitalize("hello world") // Returns "Hello world"
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a camelCase string to kebab-case
 *
 * @param str - The camelCase string
 * @returns kebab-case string
 *
 * @example
 * camelToKebab("backgroundColor") // Returns "background-color"
 */
export function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

/**
 * Converts a kebab-case string to camelCase
 *
 * @param str - The kebab-case string
 * @returns camelCase string
 *
 * @example
 * kebabToCamel("background-color") // Returns "backgroundColor"
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Pluralizes a word based on count
 *
 * @param count - The count to determine plural
 * @param singular - The singular form
 * @param plural - The plural form (optional, defaults to singular + 's')
 * @returns The appropriate form based on count
 *
 * @example
 * pluralize(1, "item") // Returns "1 item"
 * pluralize(2, "item") // Returns "2 items"
 * pluralize(2, "child", "children") // Returns "2 children"
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : plural || `${singular}s`;
  return `${count} ${word}`;
}
