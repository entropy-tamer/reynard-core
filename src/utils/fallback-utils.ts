/**
 * Utility functions for managing fallback translations
 * Provides registration and query capabilities for fallback translations
 */

import type { I18nModule } from "./i18n-types";
import { FALLBACK_TRANSLATIONS } from "./fallback-translations";

/**
 * Register additional fallback translations for a package
 * This allows packages to add their own fallback translations
 */
export function registerFallbackTranslations(packageName: string, translations: Record<string, string>): void {
  for (const [key, value] of Object.entries(translations)) {
    const prefixedKey = `${packageName}.${key}`;
    FALLBACK_TRANSLATIONS[prefixedKey] = value;
  }
}

/**
 * Get all available fallback translation keys
 */
export function getAvailableFallbackKeys(): string[] {
  return Object.keys(FALLBACK_TRANSLATIONS);
}

/**
 * Check if a fallback translation exists for a key
 */
export function hasFallbackTranslation(key: string): boolean {
  return key in FALLBACK_TRANSLATIONS;
}

/**
 * Create a mock i18n module for testing
 */
export function createMockI18n(): I18nModule {
  return {
    t: (key: string, params?: Record<string, unknown>) => {
      // Use fallback translation directly to avoid recursion
      let translation = FALLBACK_TRANSLATIONS[key] || key;

      // Simple parameter substitution
      if (params) {
        for (const [paramKey, paramValue] of Object.entries(params)) {
          translation = translation.replace(`{${paramKey}}`, String(paramValue));
        }
      }

      return translation;
    },
    setLocale: () => {},
    getLocale: () => "en",
    addTranslations: () => {},
    hasTranslation: (key: string) => key in FALLBACK_TRANSLATIONS,
    locale: () => "en",
    isRTL: false,
    languages: ["en"],
  };
}
