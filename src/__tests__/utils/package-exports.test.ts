/**
 * Tests for Package Exports
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLazyExport, getLazyExport, clearExportRegistry, mlPackages } from "../../utils/package-exports";

// Mock the lazy-loading module
vi.mock("../lazy-loading", () => ({
  createLazyExport: vi.fn(),
  getLazyExport: vi.fn(),
  clearExportRegistry: vi.fn(),
  mlPackages: {
    torch: { loader: vi.fn() },
    transformers: { loader: vi.fn() },
    numpy: { loader: vi.fn() },
  },
}));

describe("Package Exports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createLazyExport", () => {
    it("should re-export createLazyExport from lazy-loading", () => {
      const mockLazyExport = { test: "export" };
      const mockCreateLazyExport = vi.mocked(createLazyExport);
      mockCreateLazyExport.mockReturnValue(mockLazyExport as any);

      const result = createLazyExport("test-package");

      expect(mockCreateLazyExport).toHaveBeenCalledWith("test-package");
      expect(result).toBe(mockLazyExport);
    });

    it("should pass through all arguments", () => {
      const mockLoader = vi.fn();
      const mockOptions = { validationLevel: 1 };
      const mockLazyExport = { test: "export" };
      const mockCreateLazyExport = vi.mocked(createLazyExport);
      mockCreateLazyExport.mockReturnValue(mockLazyExport as any);

      const result = createLazyExport("test-package", mockLoader, mockOptions);

      expect(mockCreateLazyExport).toHaveBeenCalledWith("test-package", mockLoader, mockOptions);
      expect(result).toBe(mockLazyExport);
    });
  });

  describe("getLazyExport", () => {
    it("should re-export getLazyExport from lazy-loading", () => {
      const mockLazyExport = { test: "export" };
      const mockGetLazyExport = vi.mocked(getLazyExport);
      mockGetLazyExport.mockReturnValue(mockLazyExport as any);

      const result = getLazyExport("test-package");

      expect(mockGetLazyExport).toHaveBeenCalledWith("test-package");
      expect(result).toBe(mockLazyExport);
    });

    it("should pass through all arguments", () => {
      const mockLoader = vi.fn();
      const mockLazyExport = { test: "export" };
      const mockGetLazyExport = vi.mocked(getLazyExport);
      mockGetLazyExport.mockReturnValue(mockLazyExport as any);

      const result = getLazyExport("test-package", mockLoader);

      expect(mockGetLazyExport).toHaveBeenCalledWith("test-package", mockLoader);
      expect(result).toBe(mockLazyExport);
    });
  });

  describe("clearExportRegistry", () => {
    it("should re-export clearExportRegistry from lazy-loading", () => {
      const mockClearExportRegistry = vi.mocked(clearExportRegistry);

      clearExportRegistry();

      expect(mockClearExportRegistry).toHaveBeenCalled();
    });
  });

  describe("mlPackages", () => {
    it("should re-export mlPackages from lazy-loading", () => {
      expect(mlPackages).toBeDefined();
      expect(typeof mlPackages).toBe("object");
    });

    it("should contain expected ML package configurations", () => {
      expect(mlPackages.torch).toBeDefined();
      expect(mlPackages.transformers).toBeDefined();
      expect(mlPackages.numpy).toBeDefined();
    });
  });

  describe("backward compatibility", () => {
    it("should maintain same API as lazy-loading module", () => {
      // Test that all expected functions are available
      expect(typeof createLazyExport).toBe("function");
      expect(typeof getLazyExport).toBe("function");
      expect(typeof clearExportRegistry).toBe("function");
      expect(typeof mlPackages).toBe("object");
    });

    it("should work with existing code that imports from package-exports", () => {
      const mockLazyExport = { test: "export" };
      const mockCreateLazyExport = vi.mocked(createLazyExport);
      mockCreateLazyExport.mockReturnValue(mockLazyExport as any);

      // Simulate existing code usage
      const export1 = createLazyExport("package1");
      const export2 = getLazyExport("package2");
      clearExportRegistry();

      expect(mockCreateLazyExport).toHaveBeenCalledWith("package1");
      expect(export1).toBe(mockLazyExport);
    });
  });
});
