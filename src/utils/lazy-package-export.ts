/**
 * @file lazy-package-export implementation
 */

/**
 * Lazy Package Export Utilities
 * Re-exports from the main lazy-loading module for backward compatibility
 */

// Re-export the main LazyPackageExport class from lazy-loading
export { LazyPackageExport } from "../lazy-loading/lazy-package-export.js";

// Keep the interface and implementation for any code that might depend on them
export interface LazyPackageExportInterface<T = any> {
  readonly packageName: string;
  readonly loader: () => Promise<T>;
  readonly loaded: boolean;
  readonly value?: T;
  readonly error?: Error;
}

/**
 *
 */
export class LazyPackageExportImpl<T = any> implements LazyPackageExportInterface<T> {
  public readonly packageName: string;
  public readonly loader: () => Promise<T>;
  public loaded = false;
  public value?: T;
  public error?: Error;

  /**
   *
   * @param packageName
   * @param loader
   * @example
   */
  constructor(packageName: string, loader: () => Promise<T>) {
    this.packageName = packageName;
    this.loader = loader;
  }

  /**
   *
   * @example
   */
  async load(): Promise<T> {
    if (this.loaded && this.value) {
      return this.value;
    }

    if (this.error) {
      throw this.error;
    }

    try {
      this.value = await this.loader();
      this.loaded = true;
      return this.value;
    } catch (error) {
      this.error = error as Error;
      throw error;
    }
  }
}

/**
 *
 * @param packageName
 * @param loader
 * @example
 */
export function createLazyExport<T = any>(
  packageName: string,
  loader: () => Promise<T>
): LazyPackageExportInterface<T> {
  return new LazyPackageExportImpl(packageName, loader);
}
