/**
 * Lazy Package Export Utilities
 */

export interface LazyPackageExport<T = any> {
  readonly packageName: string;
  readonly loader: () => Promise<T>;
  readonly loaded: boolean;
  readonly value?: T;
  readonly error?: Error;
}

export class LazyPackageExportImpl<T = any> implements LazyPackageExport<T> {
  public readonly packageName: string;
  public readonly loader: () => Promise<T>;
  public loaded = false;
  public value?: T;
  public error?: Error;

  constructor(packageName: string, loader: () => Promise<T>) {
    this.packageName = packageName;
    this.loader = loader;
  }

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

export function createLazyExport<T = any>(packageName: string, loader: () => Promise<T>): LazyPackageExport<T> {
  return new LazyPackageExportImpl(packageName, loader);
}
