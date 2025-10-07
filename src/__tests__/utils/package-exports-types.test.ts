/**
 * @file Tests for utils
 */

/**
 * Tests for Package Exports Types
 */

import { describe, it, expect } from "vitest";
import { t } from "../../utils/optional-i18n";
import {
  ExportType,
  ExportValidationLevel,
  ExportValidationError,
  type ExportMetadata,
} from "../../utils/package-exports-types";

describe("Package Exports Types", () => {
  describe("ExportType enum", () => {
    it("should have correct enum values", () => {
      expect(ExportType.MODULE).toBe("module");
      expect(ExportType.COMPONENT).toBe("component");
      expect(ExportType.FUNCTION).toBe("function");
      expect(ExportType.CLASS).toBe("class");
      expect(ExportType.CONSTANT).toBe("constant");
    });

    it("should have all expected enum members", () => {
      const expectedValues = ["module", "component", "function", "class", "constant"];
      const actualValues = Object.values(ExportType);

      expect(actualValues).toEqual(expect.arrayContaining(expectedValues));
      expect(actualValues.length).toBe(expectedValues.length);
    });
  });

  describe("ExportValidationLevel enum", () => {
    it("should have correct enum values", () => {
      expect(ExportValidationLevel.NONE).toBe("none");
      expect(ExportValidationLevel.BASIC).toBe("basic");
      expect(ExportValidationLevel.STRICT).toBe("strict");
      expect(ExportValidationLevel.COMPREHENSIVE).toBe("comprehensive");
    });

    it("should have all expected enum members", () => {
      const expectedValues = ["none", "basic", "strict", "comprehensive"];
      const actualValues = Object.values(ExportValidationLevel);

      expect(actualValues).toEqual(expect.arrayContaining(expectedValues));
      expect(actualValues.length).toBe(expectedValues.length);
    });
  });

  describe("ExportValidationError", () => {
    it("should create error with message and package name", () => {
      const error = new ExportValidationError(t("core.test.error"), "test-package");

      expect(error.message).toBe(
        t("core.errors.exportValidationFailed", {
          package: "test-package",
          errors: "core.test.error",
        })
      );
      expect(error.packageName).toBe("test-package");
      expect(error.name).toBe("Error"); // Custom error classes inherit from Error
    });

    it("should be instance of Error", () => {
      const error = new ExportValidationError(t("core.test.error"), "test-package");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ExportValidationError);
    });

    it("should have correct stack trace", () => {
      const error = new ExportValidationError(t("core.test.error"), "test-package");

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
    });

    it("should handle empty message", () => {
      const error = new ExportValidationError("", "test-package");

      expect(error.message).toBe("Export validation failed for test-package: ");
      expect(error.packageName).toBe("test-package");
    });

    it("should handle empty package name", () => {
      const error = new ExportValidationError(t("core.test.error"), "");

      expect(error.message).toBe(
        t("core.errors.exportValidationFailed", {
          package: "",
          errors: "core.test.error",
        })
      );
      expect(error.packageName).toBe("");
    });
  });

  describe("ExportMetadata interface", () => {
    it("should have correct type structure", () => {
      const metadata: ExportMetadata = {
        packageName: "test-package",
        exportType: ExportType.MODULE,
        validationLevel: ExportValidationLevel.BASIC,
        accessCount: 0,
        errorCount: 0,
        dependencies: [],
        typeHints: {},
      };

      expect(metadata.packageName).toBe("test-package");
      expect(metadata.exportType).toBe(ExportType.MODULE);
      expect(metadata.validationLevel).toBe(ExportValidationLevel.BASIC);
      expect(metadata.accessCount).toBe(0);
      expect(metadata.errorCount).toBe(0);
      expect(metadata.dependencies).toEqual([]);
      expect(metadata.typeHints).toEqual({});
    });

    it("should support optional properties", () => {
      const metadata: ExportMetadata = {
        packageName: "test-package",
        exportType: ExportType.FUNCTION,
        validationLevel: ExportValidationLevel.STRICT,
        accessCount: 5,
        errorCount: 1,
        dependencies: ["dep1", "dep2"],
        typeHints: { returnType: "string" },
        loadTime: 1000,
        lastAccess: Date.now(),
        memoryUsage: 1024,
        lastError: t("core.errors.some-error"),
      };

      expect(metadata.loadTime).toBe(1000);
      expect(metadata.lastAccess).toBeDefined();
      expect(metadata.memoryUsage).toBe(1024);
      expect(metadata.lastError).toBe(t("core.errors.some-error"));
    });

    it("should support all export types", () => {
      const types = [
        ExportType.MODULE,
        ExportType.COMPONENT,
        ExportType.FUNCTION,
        ExportType.CLASS,
        ExportType.CONSTANT,
      ];

      types.forEach(exportType => {
        const metadata: ExportMetadata = {
          packageName: "test-package",
          exportType,
          validationLevel: ExportValidationLevel.BASIC,
          accessCount: 0,
          errorCount: 0,
          dependencies: [],
          typeHints: {},
        };

        expect(metadata.exportType).toBe(exportType);
      });
    });

    it("should support all validation levels", () => {
      const levels = [
        ExportValidationLevel.NONE,
        ExportValidationLevel.BASIC,
        ExportValidationLevel.STRICT,
        ExportValidationLevel.COMPREHENSIVE,
      ];

      levels.forEach(validationLevel => {
        const metadata: ExportMetadata = {
          packageName: "test-package",
          exportType: ExportType.MODULE,
          validationLevel,
          accessCount: 0,
          errorCount: 0,
          dependencies: [],
          typeHints: {},
        };

        expect(metadata.validationLevel).toBe(validationLevel);
      });
    });
  });

  describe("type exports", () => {
    it("should export all expected types", () => {
      // Test that types are properly exported by using them
      const metadata: ExportMetadata = {
        packageName: "test",
        exportType: ExportType.MODULE,
        validationLevel: ExportValidationLevel.BASIC,
        accessCount: 0,
        errorCount: 0,
        dependencies: [],
        typeHints: {},
      };

      expect(metadata).toBeDefined();
    });
  });
});
