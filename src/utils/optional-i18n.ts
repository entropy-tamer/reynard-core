/**
 * @file optional-i18n implementation
 */

/**
 * Centralized Optional i18n utility for Reynard Framework
 * Provides fallback functionality when i18n is not available
 * Used by all Reynard packages for graceful i18n fallback
 */

// Re-export all functionality from modular components
export { translate as t } from "./translation-core";
export { isI18nAvailable, getI18nModule } from "./translation-core";
export {
  registerFallbackTranslations,
  getAvailableFallbackKeys,
  hasFallbackTranslation,
  createMockI18n,
} from "./fallback-utils";

// Re-export types for external use
export type { I18nModule, TranslationParams } from "./i18n-types";
