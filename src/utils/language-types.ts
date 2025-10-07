/**
 * @file Type definitions for utils
 */

/**
 * Language type definitions and interfaces
 */

export interface LanguageInfo {
  monacoLanguage: string;
  displayName: string;
  isCode: boolean;
  category: "web" | "programming" | "data" | "config" | "shell" | "markup" | "other";
}

export interface FileTypeInfo {
  extension: string;
  language: LanguageInfo;
  mimeType?: string;
  description?: string;
}

export interface LanguageCategory {
  name: string;
  languages: LanguageInfo[];
  icon?: string;
}

export interface LanguageDetectionResult {
  language: LanguageInfo | null;
  confidence: number;
  method: "extension" | "content" | "shebang" | "fallback";
}

export interface CodeBlockInfo {
  language: string;
  content: string;
  startLine: number;
  endLine: number;
  isInline: boolean;
}

export interface SyntaxHighlightingOptions {
  theme?: string;
  showLineNumbers?: boolean;
  wrapLines?: boolean;
  fontSize?: number;
  tabSize?: number;
}

export interface LanguageServerInfo {
  language: string;
  serverName: string;
  version?: string;
  features: string[];
  isActive: boolean;
}
