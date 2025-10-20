/**
 * @file language-detection implementation
 */

/**
 * Language detection utilities
 */

import { LanguageInfo, LanguageDetectionResult } from "./language-types.js";
import { WEB_LANGUAGES, PROGRAMMING_LANGUAGES } from "./language-mappings.js";
import { useI18n as _useI18n } from "@entropy-tamer/reynard-i18n";

/**
 * Combined language mappings
 */
const LANGUAGE_MAP: Record<string, LanguageInfo> = {
  ...WEB_LANGUAGES,
  ...PROGRAMMING_LANGUAGES,
  // Add more mappings as needed
};

/**
 * Special filename mappings
 */
const SPECIAL_FILENAME_MAP: Record<string, LanguageInfo> = {
  "package.json": {
    monacoLanguage: "json",
    displayName: "Package.json", // Will be replaced with translation
    isCode: true,
    category: "config",
  },
  Dockerfile: {
    monacoLanguage: "dockerfile",
    displayName: "Dockerfile", // Will be replaced with translation
    isCode: true,
    category: "config",
  },
  "requirements.txt": {
    monacoLanguage: "plaintext",
    displayName: "Requirements.txt", // Will be replaced with translation
    isCode: false,
    category: "config",
  },
  "yarn.lock": {
    monacoLanguage: "plaintext",
    displayName: "Yarn.lock", // Will be replaced with translation
    isCode: false,
    category: "config",
  },
  "package-lock.json": {
    monacoLanguage: "json",
    displayName: "Package-lock.json", // Will be replaced with translation
    isCode: true,
    category: "config",
  },
};

/**
 * Detect language from file extension
 * @param filename
 * @example
 */
export function detectLanguageFromExtension(filename: string): LanguageDetectionResult {
  if (!filename || typeof filename !== "string") {
    return { language: null, confidence: 0, method: "fallback" };
  }

  // Reject extremely long filenames for security
  if (filename.length > 255) {
    return { language: null, confidence: 0, method: "fallback" };
  }

  // Check for special filenames first (exact match)
  const specialLanguage = SPECIAL_FILENAME_MAP[filename];
  if (specialLanguage) {
    return { language: specialLanguage, confidence: 1.0, method: "extension" };
  }

  const extension = filename.split(".").pop()?.toLowerCase();
  if (!extension) {
    return { language: null, confidence: 0, method: "fallback" };
  }

  const language = LANGUAGE_MAP[extension];
  if (language) {
    return { language, confidence: 1.0, method: "extension" };
  }

  return { language: null, confidence: 0, method: "fallback" };
}

/**
 * Detect language from file content (basic heuristics)
 * @param content
 * @param t
 * @example
 */
export function detectLanguageFromContent(content: string, t?: (key: string) => string): LanguageDetectionResult {
  if (!content || typeof content !== "string") {
    return { language: null, confidence: 0, method: "fallback" };
  }

  const lines = content.split("\n");
  const firstLine = lines[0]?.trim();

  // Check for shebang
  if (firstLine?.startsWith("#!")) {
    const shebang = firstLine.toLowerCase();

    if (shebang.includes("python")) {
      return {
        language: PROGRAMMING_LANGUAGES.py,
        confidence: 0.9,
        method: "shebang",
      };
    }

    if (shebang.includes("node") || shebang.includes("nodejs")) {
      return {
        language: WEB_LANGUAGES.js,
        confidence: 0.9,
        method: "shebang",
      };
    }

    if (shebang.includes("bash") || shebang.includes("sh")) {
      return {
        language: {
          monacoLanguage: "shell",
          displayName: t ? t("core.languageDetection.shell") : "Shell",
          isCode: true,
          category: "shell",
        },
        confidence: 0.9,
        method: "shebang",
      };
    }
  }

  // Check for HTML
  if (content.includes("<html") || content.includes("<!DOCTYPE")) {
    return {
      language: WEB_LANGUAGES.html,
      confidence: 0.8,
      method: "content",
    };
  }

  // Check for CSS
  if (content.includes("{") && content.includes("}") && content.includes(":")) {
    const cssPatterns = [/@import\s+/, /@media\s+/, /@keyframes\s+/, /\.\w+\s*{/, /#\w+\s*{/];

    if (cssPatterns.some(pattern => pattern.test(content))) {
      return {
        language: WEB_LANGUAGES.css,
        confidence: 0.7,
        method: "content",
      };
    }
  }

  // Check for JavaScript/TypeScript
  if (content.includes("function") || content.includes("const") || content.includes("let")) {
    if (content.includes("interface") || content.includes("type ")) {
      return {
        language: WEB_LANGUAGES.ts,
        confidence: 0.6,
        method: "content",
      };
    }

    return {
      language: WEB_LANGUAGES.js,
      confidence: 0.6,
      method: "content",
    };
  }

  return { language: null, confidence: 0, method: "fallback" };
}

/**
 * Get language info for a file
 * @param filename
 * @param content
 * @example
 */
export function getLanguageInfo(filename: string, content?: string): LanguageDetectionResult {
  // Try extension first
  const extensionResult = detectLanguageFromExtension(filename);
  if (extensionResult.language) {
    return extensionResult;
  }

  // Try content if available
  if (content) {
    const contentResult = detectLanguageFromContent(content);
    if (contentResult.language) {
      return contentResult;
    }
  }

  return { language: null, confidence: 0, method: "fallback" };
}

/**
 * Get all available languages
 * @example
 */
export function getAllLanguages(): LanguageInfo[] {
  return Object.values(LANGUAGE_MAP);
}

/**
 * Get languages by category
 * @param category
 * @example
 */
export function getLanguagesByCategory(category: LanguageInfo["category"]): LanguageInfo[] {
  return Object.values(LANGUAGE_MAP).filter(lang => lang.category === category);
}
