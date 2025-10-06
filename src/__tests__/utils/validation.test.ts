import { describe, it, expect } from "vitest";
// Note: isValidEmail, isValidPhoneNumber, validatePasswordStrength, isValidUrl
// have been moved to the dedicated reynard-validation package
import { isValidFileType, isValidFileSize } from "../../security/file-validation";
import { isValidCreditCard, isValidPostalCode, isValidSSN } from "../../utils/validation/financial";
import { isValidDate, isValidAge } from "../../utils/validation/date";
import {
  isInRange,
  isValidLength,
  isRequired,
  isValidUsername,
  isValidHexColor,
  isValidIPAddress,
} from "../../utils/validation/basic";

describe("validation", () => {
  describe("isValidCreditCard", () => {
    it("validates credit card numbers using Luhn algorithm", () => {
      expect(isValidCreditCard("4532015112830366")).toBe(true); // Valid Visa
      expect(isValidCreditCard("1234567890123456")).toBe(false); // Invalid
      expect(isValidCreditCard("123")).toBe(false); // Too short
    });
  });

  describe("isValidPostalCode", () => {
    it("validates postal codes for different countries", () => {
      expect(isValidPostalCode("12345", "US")).toBe(true);
      expect(isValidPostalCode("12345-6789", "US")).toBe(true);
      expect(isValidPostalCode("K1A 0A6", "CA")).toBe(true);
      expect(isValidPostalCode("12345", "DE")).toBe(true);
      expect(isValidPostalCode("invalid", "US")).toBe(false);
    });
  });

  describe("isValidUsername", () => {
    it("validates usernames correctly", () => {
      expect(isValidUsername("user123")).toBe(true);
      expect(isValidUsername("user_name")).toBe(true);
      expect(isValidUsername("123user")).toBe(false); // Starts with number
      expect(isValidUsername("us")).toBe(false); // Too short
      expect(isValidUsername("user-name")).toBe(false); // Contains hyphen
    });
  });

  describe("isValidHexColor", () => {
    it("validates hex colors correctly", () => {
      expect(isValidHexColor("#FF0000")).toBe(true);
      expect(isValidHexColor("#f00")).toBe(true);
      expect(isValidHexColor("#abc123")).toBe(true);
      expect(isValidHexColor("FF0000")).toBe(false); // Missing #
      expect(isValidHexColor("#GG0000")).toBe(false); // Invalid characters
    });
  });

  describe("isValidIPAddress", () => {
    it("validates IP addresses correctly", () => {
      expect(isValidIPAddress("192.168.1.1")).toBe(true);
      expect(isValidIPAddress("127.0.0.1")).toBe(true);
      expect(isValidIPAddress("256.1.1.1")).toBe(false); // Out of range
      expect(isValidIPAddress("192.168.1")).toBe(false); // Incomplete
    });
  });

  describe("isInRange", () => {
    it("validates numeric ranges correctly", () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true);
      expect(isInRange(10, 1, 10)).toBe(true);
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
    });
  });

  describe("isValidLength", () => {
    it("validates string length correctly", () => {
      expect(isValidLength("hello", 1, 10)).toBe(true);
      expect(isValidLength("", 0, 10)).toBe(true);
      expect(isValidLength("hello", 6, 10)).toBe(false);
      expect(isValidLength("hello world!", 1, 5)).toBe(false);
    });
  });

  describe("isRequired", () => {
    it("validates required fields correctly", () => {
      expect(isRequired("hello")).toBe(true);
      expect(isRequired([1, 2, 3])).toBe(true);
      expect(isRequired(0)).toBe(true);
      expect(isRequired("")).toBe(false);
      expect(isRequired("   ")).toBe(false);
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
      expect(isRequired([])).toBe(false);
    });
  });

  describe("isValidFileType", () => {
    it("validates file types correctly", () => {
      expect(isValidFileType("image.jpg", ["jpg", "png", "gif"])).toBe(true);
      expect(isValidFileType("document.pdf", ["jpg", "png", "gif"])).toBe(false);
      expect(isValidFileType("image.JPG", ["jpg", "png", "gif"])).toBe(true); // Case insensitive
    });
  });

  describe("isValidFileSize", () => {
    it("validates file sizes correctly", () => {
      expect(isValidFileSize(1024, 2048)).toBe(true);
      expect(isValidFileSize(2048, 2048)).toBe(true);
      expect(isValidFileSize(3072, 2048)).toBe(false);
    });
  });

  describe("isValidDate", () => {
    it("validates dates correctly", () => {
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 86400000);
      const yesterday = new Date(today.getTime() - 86400000);

      expect(isValidDate(today)).toBe(true);
      expect(isValidDate("2023-12-25")).toBe(true);
      expect(isValidDate("invalid-date")).toBe(false);
      expect(isValidDate(today, yesterday, tomorrow)).toBe(true);
      expect(isValidDate(yesterday, today, tomorrow)).toBe(false);
    });
  });

  describe("isValidAge", () => {
    it("validates age correctly", () => {
      const twentyYearsAgo = new Date();
      twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);

      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

      expect(isValidAge(twentyYearsAgo, 18)).toBe(true);
      expect(isValidAge(tenYearsAgo, 18)).toBe(false);
    });

    it("handles edge cases for age validation", () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 86400000);
      const tomorrow = new Date(today.getTime() + 86400000);

      expect(isValidAge(today, 0)).toBe(true);
      expect(isValidAge(yesterday, 0)).toBe(true);
      expect(isValidAge(tomorrow, 0)).toBe(false);
    });
  });

  describe("validation edge cases", () => {
    it("handles null and undefined values", () => {
      // Note: Tests for isValidEmail, isValidUrl, isValidPhoneNumber moved to reynard-validation package
      expect(isValidPostalCode(null as any, "US")).toBe(false);
      expect(isValidPostalCode("12345", null as any)).toBe(false);
      expect(isValidSSN(null as any)).toBe(false);
      expect(isValidSSN(undefined as any)).toBe(false);
    });

    it("handles empty strings", () => {
      // Note: Tests for isValidEmail, isValidUrl, isValidPhoneNumber moved to reynard-validation package
      expect(isValidHexColor("")).toBe(false);
      expect(isValidIPAddress("")).toBe(false);
      expect(isValidPostalCode("", "US")).toBe(false);
      expect(isValidSSN("")).toBe(false);
    });

    it("handles invalid input types", () => {
      // Note: Tests for isValidEmail, isValidUrl, isValidPhoneNumber moved to reynard-validation package
      expect(isValidPostalCode(123 as any, "US")).toBe(false);
      expect(isValidPostalCode("12345", 123 as any)).toBe(false);
    });

    it("handles unknown countries in postal code validation", () => {
      // Fixed: Now returns false for unknown countries instead of true
      expect(isValidPostalCode("12345", "XX")).toBe(false);
      expect(isValidPostalCode("anything", "UNKNOWN")).toBe(false);
    });

    it("handles extremely long inputs", () => {
      const longString = "a".repeat(10000);
      // Note: Tests for isValidEmail, isValidUrl, isValidPhoneNumber moved to reynard-validation package
      expect(isValidHexColor(longString)).toBe(false);
      expect(isValidIPAddress(longString)).toBe(false);
    });
  });
});
