/**
 * @file Tests for utils
 */

import { describe, it, expect } from "vitest";
import {
  getMonacoLanguage,
  getLanguageDisplayName,
  isCodeFile,
  getLanguageInfo,
  getLanguageCategory,
  getFileExtension,
  getFileNameWithoutExtension,
  getFileName,
  getDirectoryPath,
} from "../../utils/languageUtils";

describe("languageUtils", () => {
  describe("getMonacoLanguage", () => {
    it("returns correct language for known extensions", () => {
      expect(getMonacoLanguage("test.js")).toBe("javascript");
      expect(getMonacoLanguage("test.ts")).toBe("typescript");
      expect(getMonacoLanguage("test.py")).toBe("python");
      expect(getMonacoLanguage("test.html")).toBe("html");
      expect(getMonacoLanguage("test.css")).toBe("css");
    });

    it("returns correct language for known filenames", () => {
      expect(getMonacoLanguage("package.json")).toBe("json");
      expect(getMonacoLanguage("Dockerfile")).toBe("dockerfile");
      expect(getMonacoLanguage("requirements.txt")).toBe("plaintext");
    });

    it("returns plaintext for unknown extensions", () => {
      expect(getMonacoLanguage("test.unknown")).toBe("plaintext");
      expect(getMonacoLanguage("test")).toBe("plaintext");
    });

    it("handles edge cases and security", () => {
      // Null/undefined input
      expect(getMonacoLanguage(null as any)).toBe("plaintext");
      expect(getMonacoLanguage(undefined as any)).toBe("plaintext");
      expect(getMonacoLanguage("")).toBe("plaintext");

      // Directory traversal attempts - these should still work for legitimate files
      expect(getMonacoLanguage("../../../etc/passwd")).toBe("plaintext"); // No extension
      expect(getMonacoLanguage("..\\..\\windows\\system32")).toBe("plaintext"); // No extension
      expect(getMonacoLanguage("file/../../../malicious.js")).toBe("javascript"); // Has .js extension

      // Extremely long filenames
      const longFilename = "a".repeat(300) + ".js";
      expect(getMonacoLanguage(longFilename)).toBe("plaintext");

      // Extremely long extensions
      const longExtension = "test." + "a".repeat(20);
      expect(getMonacoLanguage(longExtension)).toBe("plaintext");
    });
  });

  describe("getLanguageDisplayName", () => {
    it("returns correct display names", () => {
      expect(getLanguageDisplayName("test.js")).toBe("JavaScript");
      expect(getLanguageDisplayName("test.ts")).toBe("TypeScript");
      expect(getLanguageDisplayName("package.json")).toBe("Package.json");
    });

    it("handles security edge cases", () => {
      expect(getLanguageDisplayName(null as any)).toBe("Plain Text");
      expect(getLanguageDisplayName("../../../malicious.js")).toBe("JavaScript"); // Should still work for .js files
    });
  });

  describe("isCodeFile", () => {
    it("correctly identifies code files", () => {
      expect(isCodeFile("test.js")).toBe(true);
      expect(isCodeFile("test.py")).toBe(true);
      expect(isCodeFile("test.txt")).toBe(false);
      expect(isCodeFile("test.md")).toBe(false);
    });

    it("handles security edge cases", () => {
      expect(isCodeFile(null as any)).toBe(false);
      expect(isCodeFile("../../../malicious.js")).toBe(true); // Should still work for .js files
    });
  });

  describe("getLanguageInfo", () => {
    it("returns complete language info", () => {
      const info = getLanguageInfo("test.js");
      expect(info.monacoLanguage).toBe("javascript");
      expect(info.displayName).toBe("JavaScript");
      expect(info.isCode).toBe(true);
      expect(info.category).toBe("web");
    });

    it("handles security edge cases", () => {
      const info = getLanguageInfo(null as any);
      expect(info.monacoLanguage).toBe("plaintext");
      expect(info.displayName).toBe("Plain Text");
      expect(info.isCode).toBe(false);
      expect(info.category).toBe("other");
    });
  });

  describe("path utility functions", () => {
    it("getFileExtension works correctly", () => {
      expect(getFileExtension("test.js")).toBe("js");
      expect(getFileExtension("test.min.js")).toBe("js");
      expect(getFileExtension("test")).toBe("");
      expect(getFileExtension("test.")).toBe("");
    });

    it("getFileName works correctly", () => {
      expect(getFileName("path/to/test.js")).toBe("test.js");
      expect(getFileName("test.js")).toBe("test.js");
    });

    it("getFileNameWithoutExtension works correctly", () => {
      expect(getFileNameWithoutExtension("path/to/test.js")).toBe("test");
      expect(getFileNameWithoutExtension("test.min.js")).toBe("test.min");
    });

    it("getDirectoryPath works correctly", () => {
      expect(getDirectoryPath("path/to/test.js")).toBe("path/to");
      expect(getDirectoryPath("test.js")).toBe("/");
    });
  });
});
