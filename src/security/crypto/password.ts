/**
 * @file password implementation
 */

/**
 * Password Generation Utilities
 * Functions for generating secure passwords
 */

import { t } from "../../utils/optional-i18n";
import { generateSecureString } from "./random";

/**
 * Generate a secure random password
 * @param length
 * @param options
 * @param options.includeUppercase
 * @param options.includeLowercase
 * @param options.includeNumbers
 * @param options.includeSymbols
 * @param options.excludeSimilar
 * @example
 */
export function generateSecurePassword(
  length: number = 16,
  options: {
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    excludeSimilar?: boolean;
  } = {}
): string {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = true,
  } = options;

  let charset = "";

  if (includeUppercase) {
    charset += excludeSimilar ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }

  if (includeLowercase) {
    charset += excludeSimilar ? "abcdefghijkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
  }

  if (includeNumbers) {
    charset += excludeSimilar ? "23456789" : "0123456789";
  }

  if (includeSymbols) {
    charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  }

  if (charset.length === 0) {
    throw new Error(t("core.security.at-least-one-character-type-must-be-included"));
  }

  return generateSecureString(length, charset);
}
