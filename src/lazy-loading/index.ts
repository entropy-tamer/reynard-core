/**
 * @file Index file for lazy-loading
 */

/**
 * Frontend Lazy Loading Module
 *
 * Exports frontend lazy loading functionality for dynamic module loading.
 * Backend lazy loading is handled by the Python backend.
 */

// Re-export all types and enums
export * from "../utils/package-exports-types";

// Re-export the main class
export { LazyPackageExport } from "./lazy-package-export";

// Re-export registry functions and ML packages
export * from "./package-export-registry";
