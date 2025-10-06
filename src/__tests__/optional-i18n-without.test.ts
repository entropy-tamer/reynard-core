/**
 * Tests for optional i18n functionality without i18n package
 * Verifies fallback behavior when i18n is not available
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { t, isI18nAvailable, getI18nModule } from "../utils/optional-i18n";

describe("Optional i18n functionality without i18n package", () => {
  beforeEach(() => {
    // Mock require to throw error (simulating missing i18n package)
    (global as any).require = vi.fn(() => {
      throw new Error("Cannot find module 'reynard-i18n'");
    });
  });

  it("should return fallback translations when i18n is not available", () => {
    expect(isI18nAvailable()).toBe(false);
    expect(getI18nModule()).toBe(null);

    // Test fallback translations
    expect(t("core.errors.generic")).toBe("An error occurred");
    expect(t("core.errors.network")).toBe("Network error");
    expect(t("core.test.notification")).toBe("Test notification");
  });

  it("should handle parameter substitution in fallback translations", () => {
    const result = t("core.errors.exportValidationFailed", {
      package: "test-package",
      errors: "validation error",
    });
    expect(result).toBe("Export validation failed for test-package: validation error");
  });

  it("should return the key when no fallback translation exists", () => {
    const result = t("core.nonexistent.key");
    expect(result).toBe("core.nonexistent.key");
  });

  it("should handle null and undefined parameters", () => {
    expect(t("core.errors.generic", null as any)).toBe("An error occurred");
    expect(t("core.errors.generic", undefined as any)).toBe("An error occurred");
  });

  it("should handle empty parameter objects", () => {
    const result = t("core.errors.generic", {});
    expect(result).toBe("An error occurred");
  });
});
