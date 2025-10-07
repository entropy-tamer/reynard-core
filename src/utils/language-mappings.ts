/**
 * @file language-mappings implementation
 */

/**
 * Language mappings for file extensions
 */

import { LanguageInfo } from "./language-types.js";

/**
 * Web technologies language mappings
 */
export const WEB_LANGUAGES: Record<string, LanguageInfo> = {
  js: {
    monacoLanguage: "javascript",
    displayName: "JavaScript",
    isCode: true,
    category: "web",
  },
  ts: {
    monacoLanguage: "typescript",
    displayName: "TypeScript",
    isCode: true,
    category: "web",
  },
  jsx: {
    monacoLanguage: "javascript",
    displayName: "JSX",
    isCode: true,
    category: "web",
  },
  tsx: {
    monacoLanguage: "typescript",
    displayName: "TSX",
    isCode: true,
    category: "web",
  },
  html: {
    monacoLanguage: "html",
    displayName: "HTML",
    isCode: true,
    category: "markup",
  },
  css: {
    monacoLanguage: "css",
    displayName: "CSS",
    isCode: true,
    category: "markup",
  },
  scss: {
    monacoLanguage: "scss",
    displayName: "SCSS",
    isCode: true,
    category: "markup",
  },
  sass: {
    monacoLanguage: "sass",
    displayName: "Sass",
    isCode: true,
    category: "markup",
  },
  less: {
    monacoLanguage: "less",
    displayName: "Less",
    isCode: true,
    category: "markup",
  },
  vue: {
    monacoLanguage: "vue",
    displayName: "Vue",
    isCode: true,
    category: "web",
  },
  svelte: {
    monacoLanguage: "svelte",
    displayName: "Svelte",
    isCode: true,
    category: "web",
  },
};

/**
 * Programming languages mappings
 */
export const PROGRAMMING_LANGUAGES: Record<string, LanguageInfo> = {
  py: {
    monacoLanguage: "python",
    displayName: "Python",
    isCode: true,
    category: "programming",
  },
  java: {
    monacoLanguage: "java",
    displayName: "Java",
    isCode: true,
    category: "programming",
  },
  cpp: {
    monacoLanguage: "cpp",
    displayName: "C++",
    isCode: true,
    category: "programming",
  },
  c: {
    monacoLanguage: "c",
    displayName: "C",
    isCode: true,
    category: "programming",
  },
  cs: {
    monacoLanguage: "csharp",
    displayName: "C#",
    isCode: true,
    category: "programming",
  },
  go: {
    monacoLanguage: "go",
    displayName: "Go",
    isCode: true,
    category: "programming",
  },
  rs: {
    monacoLanguage: "rust",
    displayName: "Rust",
    isCode: true,
    category: "programming",
  },
  php: {
    monacoLanguage: "php",
    displayName: "PHP",
    isCode: true,
    category: "programming",
  },
  rb: {
    monacoLanguage: "ruby",
    displayName: "Ruby",
    isCode: true,
    category: "programming",
  },
  swift: {
    monacoLanguage: "swift",
    displayName: "Swift",
    isCode: true,
    category: "programming",
  },
  kt: {
    monacoLanguage: "kotlin",
    displayName: "Kotlin",
    isCode: true,
    category: "programming",
  },
  scala: {
    monacoLanguage: "scala",
    displayName: "Scala",
    isCode: true,
    category: "programming",
  },
  clj: {
    monacoLanguage: "clojure",
    displayName: "Clojure",
    isCode: true,
    category: "programming",
  },
  hs: {
    monacoLanguage: "haskell",
    displayName: "Haskell",
    isCode: true,
    category: "programming",
  },
  elm: {
    monacoLanguage: "elm",
    displayName: "Elm",
    isCode: true,
    category: "programming",
  },
  dart: {
    monacoLanguage: "dart",
    displayName: "Dart",
    isCode: true,
    category: "programming",
  },
  r: {
    monacoLanguage: "r",
    displayName: "R",
    isCode: true,
    category: "programming",
  },
  julia: {
    monacoLanguage: "julia",
    displayName: "Julia",
    isCode: true,
    category: "programming",
  },
  lua: {
    monacoLanguage: "lua",
    displayName: "Lua",
    isCode: true,
    category: "programming",
  },
  perl: {
    monacoLanguage: "perl",
    displayName: "Perl",
    isCode: true,
    category: "programming",
  },
  pl: {
    monacoLanguage: "perl",
    displayName: "Perl",
    isCode: true,
    category: "programming",
  },
};
