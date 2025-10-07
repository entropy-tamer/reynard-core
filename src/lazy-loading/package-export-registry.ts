/**
 * @file package-export-registry implementation
 */

/**
 * Package Export Registry
 *
 * Manages the global registry of lazy package exports and provides
 * convenience functions for common ML packages.
 */

import { LazyPackageExport } from "./lazy-package-export";
import { ExportValidationLevel } from "../utils/package-exports-types";

// Global export registry
const _exportRegistry = new Map<string, LazyPackageExport>();

/**
 *
 * @param packageName
 * @param loader
 * @param validationLevel
 * @example
 */
export function createLazyExport(
  packageName: string,
  loader?: () => Promise<any>,
  validationLevel: ExportValidationLevel = ExportValidationLevel.BASIC
): LazyPackageExport {
  if (!_exportRegistry.has(packageName)) {
    _exportRegistry.set(packageName, new LazyPackageExport(packageName, loader, validationLevel));
  }
  return _exportRegistry.get(packageName)!;
}

/**
 *
 * @param packageName
 * @example
 */
export function getLazyExport(packageName: string): LazyPackageExport | undefined {
  return _exportRegistry.get(packageName);
}

/**
 *
 * @example
 */
export function clearExportRegistry(): void {
  _exportRegistry.clear();
}

// Convenience function for common ML packages
export const mlPackages = {
  torch: () => createLazyExport("torch"),
  transformers: () => createLazyExport("transformers"),
  safetensors: () => createLazyExport("safetensors"),
  timm: () => createLazyExport("timm"),
  torchvision: () => createLazyExport("torchvision"),
  pillow: () => createLazyExport("PIL"),
  numpy: () => createLazyExport("numpy"),
};
