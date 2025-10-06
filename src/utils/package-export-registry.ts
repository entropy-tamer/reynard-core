/**
 * Package Export Registry
 */

import { LazyPackageExport, LazyPackageExportImpl } from "./lazy-package-export";

const exportRegistry = new Map<string, LazyPackageExport>();

export function createLazyExport(packageName: string, loader: () => Promise<any>): LazyPackageExport {
  const lazyExport = new LazyPackageExportImpl(packageName, loader);
  exportRegistry.set(packageName, lazyExport);
  return lazyExport;
}

export function getLazyExport(packageName: string): LazyPackageExport | undefined {
  return exportRegistry.get(packageName);
}

export function clearExportRegistry(): void {
  exportRegistry.clear();
}

export const mlPackages = {
  // Temporarily disabled until AI packages are built
  // "reynard-ai-shared": createLazyExport("reynard-ai-shared", () => import("reynard-ai-shared")),
  // "reynard-ai-rag": createLazyExport("reynard-ai-rag", () => import("reynard-rag")),
  // "reynard-ai-multimodal": createLazyExport("reynard-ai-multimodal", () => import("reynard-multimodal")),
};

// Re-export for backward compatibility
export type { LazyPackageExport, LazyPackageExportImpl } from "./lazy-package-export";
