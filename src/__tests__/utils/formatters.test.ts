/**
 * @file Tests for utils
 */

import { describe, it, expect } from "vitest";
import {
  formatFileSize,
  formatBytes,
  formatDateTime,
  formatNumber,
  formatCurrency,
  formatPercentage,
  truncateText,
  capitalize,
  camelToKebab,
  kebabToCamel,
  pluralize,
} from "../../utils/formatters";

describe("formatters", () => {
  describe("formatFileSize", () => {
    it("formats bytes correctly", () => {
      expect(formatFileSize(0)).toBe("0 B");
      expect(formatFileSize(500)).toBe("500 B"); // No decimal for bytes < 1024
      expect(formatFileSize(1024)).toBe("1.0 KB");
      expect(formatFileSize(1536)).toBe("1.5 KB");
      expect(formatFileSize(1024 * 1024)).toBe("1.0 MB");
      expect(formatFileSize(1024 * 1024 * 1024)).toBe("1.0 GB");
    });
  });

  describe("formatBytes", () => {
    it("formats bytes with custom precision", () => {
      expect(formatBytes(1024, 2)).toBe("1.00 KB"); // formatBytes uses custom precision
      expect(formatBytes(1536, 1)).toBe("1.5 KB");
      expect(formatBytes(1024 * 1024, 0)).toBe("1 MB");
    });
  });

  describe("formatNumber", () => {
    it("formats numbers with default locale", () => {
      expect(formatNumber(1234567)).toBe("1,234,567");
      expect(formatNumber(1234.56)).toBe("1,234.56");
    });

    it("formats numbers with custom locale", () => {
      expect(formatNumber(1234567, "de-DE")).toMatch(/1\.234\.567/);
      expect(formatNumber(1234.56, "de-DE")).toMatch(/1\.234,56/);
    });
  });

  describe("formatCurrency", () => {
    it("formats currency correctly", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
      expect(formatCurrency(1234.56, "EUR", "de-DE")).toMatch(/1\.234,56/);
    });
  });

  describe("formatPercentage", () => {
    it("formats percentages correctly", () => {
      expect(formatPercentage(0.1234)).toBe("12.34%");
      expect(formatPercentage(0.1234, 1)).toBe("12.3%");
      expect(formatPercentage(1)).toBe("100.00%");
    });
  });

  describe("truncateText", () => {
    it("truncates text correctly", () => {
      expect(truncateText("Hello world!", 5)).toBe("He..."); // "He" + "..." = 5 chars
      expect(truncateText("Hello world!", 15)).toBe("Hello world!");
      expect(truncateText("Hello world!", 5, "…")).toBe("Hell…"); // "Hell" + "…" = 5 chars
    });
  });

  describe("capitalize", () => {
    it("capitalizes first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("HELLO")).toBe("HELLO");
      expect(capitalize("")).toBe("");
    });
  });

  describe("camelToKebab", () => {
    it("converts camelCase to kebab-case", () => {
      expect(camelToKebab("backgroundColor")).toBe("background-color");
      expect(camelToKebab("fontSize")).toBe("font-size");
      expect(camelToKebab("hello")).toBe("hello");
    });
  });

  describe("kebabToCamel", () => {
    it("converts kebab-case to camelCase", () => {
      expect(kebabToCamel("background-color")).toBe("backgroundColor");
      expect(kebabToCamel("font-size")).toBe("fontSize");
      expect(kebabToCamel("hello")).toBe("hello");
    });
  });

  describe("pluralize", () => {
    it("pluralizes words correctly", () => {
      expect(pluralize(1, "item")).toBe("1 item");
      expect(pluralize(2, "item")).toBe("2 items");
      expect(pluralize(2, "child", "children")).toBe("2 children");
      expect(pluralize(0, "item")).toBe("0 items");
    });
  });

  describe("edge cases and security", () => {
    it("handles invalid inputs in formatFileSize", () => {
      expect(formatFileSize(NaN)).toBe("0 B");
      expect(formatFileSize(Infinity)).toBe("0 B");
      expect(formatFileSize(-Infinity)).toBe("0 B");
      expect(formatFileSize(null as any)).toBe("0 B");
      expect(formatFileSize(undefined as any)).toBe("0 B");
      expect(formatFileSize("invalid" as any)).toBe("0 B");
    });

    it("handles extremely large numbers in formatFileSize", () => {
      expect(formatFileSize(Number.MAX_SAFE_INTEGER + 1)).toBe("> 1 PB");
      expect(formatFileSize(1e20)).toBe("> 1 PB");
    });

    it("handles invalid inputs in formatBytes", () => {
      expect(formatBytes(NaN)).toBe("0 B");
      expect(formatBytes(Infinity)).toBe("0 B");
      expect(formatBytes(null as any)).toBe("0 B");
      expect(formatBytes(undefined as any)).toBe("0 B");
    });

    it("handles invalid precision in formatBytes", () => {
      expect(formatBytes(1024, -1)).toBe("1.0 KB"); // Should default to 1
      expect(formatBytes(1024, 11)).toBe("1.0 KB"); // Should default to 1
      expect(formatBytes(1024, NaN)).toBe("1.0 KB"); // Should default to 1
    });

    it("handles invalid inputs in formatDateTime", () => {
      expect(formatDateTime(null as any)).toBe("Invalid Date");
      expect(formatDateTime(undefined as any)).toBe("Invalid Date");
      expect(formatDateTime("")).toBe("Invalid Date");
      expect(formatDateTime("invalid-date")).toBe("Invalid Date");
      expect(formatDateTime(NaN)).toBe("Invalid Date");
      expect(formatDateTime(-1)).toBe("Invalid Date");
    });

    it("handles invalid inputs in formatNumber", () => {
      expect(formatNumber(NaN)).toBe("0");
      expect(formatNumber(Infinity)).toBe("0");
      expect(formatNumber(null as any)).toBe("0");
      expect(formatNumber(undefined as any)).toBe("0");
    });

    it("handles invalid locale in formatNumber", () => {
      expect(formatNumber(1234, "")).toBe("1,234");
      expect(formatNumber(1234, null as any)).toBe("1,234");
      expect(formatNumber(1234, "invalid-locale")).toBe("1,234"); // Should fallback
    });

    it("handles edge cases in truncateText", () => {
      expect(truncateText("hello", 0)).toBe("...");
      expect(truncateText("hello", 1)).toBe("...");
      expect(truncateText("hello", 2)).toBe("...");
      expect(truncateText("hello", 3)).toBe("...");
      expect(truncateText("hello", 4)).toBe("h...");
    });
  });
});
