/**
 * @file number implementation
 */

/**
 * Number Formatting Utilities
 * Functions for formatting numbers, currency, and percentages
 */

/**
 * Formats a number with thousand separators
 *
 * @param num - The number to format
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @returns A string with formatted number
 *
 * @example
 * formatNumber(1234567) // Returns "1,234,567"
 * formatNumber(1234567, 'de-DE') // Returns "1.234.567"
 */
export function formatNumber(num: number, locale: string = "en-US"): string {
  // Handle edge cases
  if (typeof num !== "number" || !isFinite(num)) {
    return "0";
  }

  if (typeof locale !== "string" || locale.trim() === "") {
    locale = "en-US";
  }

  try {
    return new Intl.NumberFormat(locale).format(num);
  } catch (error) {
    // Fallback to default locale if provided locale is invalid
    return new Intl.NumberFormat("en-US").format(num);
  }
}

/**
 * Formats a number as currency
 *
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'USD', 'EUR')
 * @param locale - The locale to use for formatting
 * @returns A string with formatted currency
 *
 * @example
 * formatCurrency(1234.56, 'USD') // Returns "$1,234.56"
 * formatCurrency(1234.56, 'EUR', 'de-DE') // Returns "1.234,56 €"
 */
export function formatCurrency(amount: number, currency: string = "USD", locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Formats a percentage with specified decimal places
 *
 * @param value - The decimal value (0.5 = 50%)
 * @param decimals - Number of decimal places to show
 * @returns A string with formatted percentage
 *
 * @example
 * formatPercentage(0.1234) // Returns "12.34%"
 * formatPercentage(0.1234, 1) // Returns "12.3%"
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
