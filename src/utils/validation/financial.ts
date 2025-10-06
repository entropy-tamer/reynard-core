/**
 * Financial Validation Utilities
 * Functions for validating financial data like credit cards and SSNs
 */

/**
 * Credit card number validation using Luhn algorithm
 */
export function isValidCreditCard(cardNumber: string): boolean {
  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, "");

  // Check if it's a valid length
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * ZIP/Postal code validation (US and international)
 */
export function isValidPostalCode(postalCode: string, country: string = "US"): boolean {
  // Handle null/undefined/empty input
  if (!postalCode || typeof postalCode !== "string" || !country || typeof country !== "string") {
    return false;
  }

  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/, // 12345 or 12345-6789
    CA: /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/, // A1A 1A1
    UK: /^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$/, // SW1A 1AA
    DE: /^\d{5}$/, // 12345
    FR: /^\d{5}$/, // 12345
    JP: /^\d{3}-\d{4}$/, // 123-4567
    AU: /^\d{4}$/, // 1234
  };

  const pattern = patterns[country.toUpperCase()];
  return pattern ? pattern.test(postalCode) : false; // Return false for unknown countries
}

/**
 * Social Security Number validation (US format)
 */
export function isValidSSN(ssn: string): boolean {
  // Handle null/undefined/empty input
  if (!ssn || typeof ssn !== "string") {
    return false;
  }

  // Remove all non-digit characters
  const digits = ssn.replace(/\D/g, "");

  // Must be exactly 9 digits
  if (digits.length !== 9) {
    return false;
  }

  // Invalid patterns
  const invalidPatterns = [
    "000000000",
    "111111111",
    "222222222",
    "333333333",
    "444444444",
    "555555555",
    "666666666",
    "777777777",
    "888888888",
    "999999999",
  ];

  if (invalidPatterns.includes(digits)) {
    return false;
  }

  // Area number cannot be 000, 666, or 900-999
  const area = parseInt(digits.substring(0, 3));
  if (area === 0 || area === 666 || area >= 900) {
    return false;
  }

  // Group number cannot be 00
  const group = parseInt(digits.substring(3, 5));
  if (group === 0) {
    return false;
  }

  // Serial number cannot be 0000
  const serial = parseInt(digits.substring(5, 9));
  if (serial === 0) {
    return false;
  }

  return true;
}
