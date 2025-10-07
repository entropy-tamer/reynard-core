/**
 * @file Type definitions for utils
 */

/**
 * Type definitions for i18n module interface
 * Used by optional-i18n utility for type safety
 */

// Type for the i18n module when available
export interface I18nModule {
  t: (key: string, params?: Record<string, unknown>) => string;
  setLocale: (locale: string) => void;
  getLocale: () => string;
  addTranslations: (translations: Record<string, unknown>) => void;
  hasTranslation: (key: string) => boolean;
  locale: () => string;
  isRTL: boolean;
  languages: string[];
}

// Type for translation parameters
export type TranslationParams = Record<string, unknown>;

// Type for fallback translation registration
export interface FallbackTranslationRegistration {
  packageName: string;
  translations: Record<string, string>;
}
