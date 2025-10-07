/**
 * @file translation-core implementation
 */

/**
 * Core translation functionality for optional i18n
 * Handles the main translation logic with fallback support
 */

import type { I18nModule, TranslationParams } from "./i18n-types";
import { FALLBACK_TRANSLATIONS } from "./fallback-translations";

// Cache for the i18n module
const i18nModule: I18nModule | null = null;
let i18nAvailable = false;

/**
 * Attempts to load the i18n module dynamically
 * Returns true if successful, false otherwise
 * DISABLED: Always returns false to prevent recursion issues
 * @example
 */
function tryLoadI18n(): boolean {
  // Always return false to prevent i18n loading and recursion issues
  i18nAvailable = false;
  return false;
}

/**
 * Translation function that falls back to hardcoded strings when i18n is unavailable
 * @param key
 * @param params
 * @example
 */
export function translate(key: string, params?: TranslationParams): string {
  // Try to load i18n if not already attempted
  if (i18nModule === null) {
    tryLoadI18n();
  }

  // Use i18n if available
  if (i18nAvailable && i18nModule) {
    try {
      return i18nModule.t(key, params);
    } catch (error) {
      // Fall through to fallback
    }
  }

  // Use fallback translation
  let translation = FALLBACK_TRANSLATIONS[key] || key;

  // Simple parameter substitution
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      translation = translation.replace(`{${paramKey}}`, String(paramValue));
    }
  }

  return translation;
}

/**
 * Check if i18n is available
 * @example
 */
export function isI18nAvailable(): boolean {
  if (i18nModule === null) {
    tryLoadI18n();
  }
  return i18nAvailable;
}

/**
 * Get the i18n module if available, null otherwise
 * @example
 */
export function getI18nModule(): I18nModule | null {
  if (i18nModule === null) {
    tryLoadI18n();
  }
  return i18nAvailable ? i18nModule : null;
}
