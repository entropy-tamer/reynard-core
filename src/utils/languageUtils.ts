/**
 * @file languageUtils implementation
 */

/**
 * Language Utilities
 * Main module that re-exports language detection and mapping functions
 */

import { getLanguageInfo as getLanguageInfoFromDetection } from "./language-detection.js";

// Re-export types
export type {
  LanguageInfo,
  FileTypeInfo,
  LanguageCategory,
  LanguageDetectionResult,
  CodeBlockInfo,
  SyntaxHighlightingOptions,
  LanguageServerInfo,
} from "./language-types.js";

// Re-export language mappings
export { WEB_LANGUAGES, PROGRAMMING_LANGUAGES } from "./language-mappings.js";

// Re-export language detection functions
export {
  detectLanguageFromExtension,
  detectLanguageFromContent,
  getAllLanguages,
  getLanguagesByCategory,
} from "./language-detection.js";

// Import for internal use
import {
  detectLanguageFromExtension,
  detectLanguageFromContent as _detectLanguageFromContent,
} from "./language-detection.js";
import { useI18n as _useI18n } from "reynard-i18n";

// Legacy exports for backward compatibility
export { getLanguageInfo as detectLanguage } from "./language-detection.js";
export { getAllLanguages as getSupportedLanguages } from "./language-detection.js";

// Legacy function exports for backward compatibility with tests
/**
 *
 * @param filename
 * @example
 */
export function getMonacoLanguage(filename: string): string {
  const result = detectLanguageFromExtension(filename);
  return result.language?.monacoLanguage || "plaintext";
}

/**
 *
 * @param filename
 * @param t
 * @example
 */
export function getLanguageDisplayName(filename: string, t?: (key: string) => string): string {
  const result = detectLanguageFromExtension(filename);
  return result.language?.displayName || (t ? t("core.languageDetection.plainText") : "Plain Text");
}

/**
 *
 * @param filename
 * @example
 */
export function isCodeFile(filename: string): boolean {
  const result = detectLanguageFromExtension(filename);
  return result.language?.isCode || false;
}

/**
 *
 * @param filename
 * @example
 */
export function getLanguageCategory(filename: string): string {
  const result = detectLanguageFromExtension(filename);
  return result.language?.category || "other";
}

// Legacy getLanguageInfo function that returns the expected structure
/**
 *
 * @param filename
 * @example
 */
export function getLanguageInfo(filename: string): {
  monacoLanguage: string;
  displayName: string;
  isCode: boolean;
  category: string;
} {
  const result = getLanguageInfoFromDetection(filename);
  if (result.language) {
    return {
      monacoLanguage: result.language.monacoLanguage,
      displayName: result.language.displayName,
      isCode: result.language.isCode,
      category: result.language.category,
    };
  }

  return {
    monacoLanguage: "plaintext",
    displayName: "Plain Text",
    isCode: false,
    category: "other",
  };
}

// Path utility functions
/**
 *
 * @param filename
 * @example
 */
export function getFileExtension(filename: string): string {
  if (!filename || typeof filename !== "string") return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
}

/**
 *
 * @param path
 * @example
 */
export function getFileName(path: string): string {
  if (!path || typeof path !== "string") return "";
  return path.split(/[/\\]/).pop() || "";
}

/**
 *
 * @param path
 * @example
 */
export function getFileNameWithoutExtension(path: string): string {
  const filename = getFileName(path);
  const extension = getFileExtension(filename);
  return extension ? filename.slice(0, -(extension.length + 1)) : filename;
}

/**
 *
 * @param path
 * @example
 */
export function getDirectoryPath(path: string): string {
  if (!path || typeof path !== "string") return "/";
  const parts = path.split(/[/\\]/);
  parts.pop(); // Remove filename
  return parts.length > 0 ? parts.join("/") : "/";
}
