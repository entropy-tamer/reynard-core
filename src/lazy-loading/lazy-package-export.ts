/**
 * @file lazy-package-export implementation
 */

/**
 * Lazy Package Export Implementation
 *
 * Provides lazy loading functionality for heavy ML packages with proxy-based
 * loading, validation, and performance monitoring.
 */

import { t } from "../utils/optional-i18n";
import {
  ExportMetadata,
  ExportValidationError,
  ExportValidationLevel,
  ExportType,
} from "../utils/package-exports-types";

/**
 *
 */
export class LazyPackageExport {
  private _module: any = null;
  private _metadata: ExportMetadata;
  private _validationLevel: ExportValidationLevel;
  private _enablePerformanceMonitoring: boolean;
  private _autoCleanup: boolean;

  /**
   *
   * @param _packageName
   * @param _loader
   * @param validationLevel
   * @param enablePerformanceMonitoring
   * @param autoCleanup
   * @example
   */
  constructor(
    private _packageName: string,
    private _loader?: () => Promise<any>,
    validationLevel: ExportValidationLevel = ExportValidationLevel.BASIC,
    enablePerformanceMonitoring: boolean = true,
    autoCleanup: boolean = true
  ) {
    this._validationLevel = validationLevel;
    this._enablePerformanceMonitoring = enablePerformanceMonitoring;
    this._autoCleanup = autoCleanup;
    this._metadata = {
      packageName: _packageName,
      exportType: ExportType.MODULE,
      validationLevel,
      accessCount: 0,
      errorCount: 0,
      dependencies: [],
      typeHints: {},
    };
  }

  /**
   *
   * @example
   */
  async getModule(): Promise<any> {
    if (this._module) {
      this._updateAccessStats();
      return this._module;
    }

    const startTime = this._enablePerformanceMonitoring ? performance.now() : 0;

    try {
      if (this._loader) {
        this._module = await this._loader();
      } else {
        this._module = await this._dynamicImport();
      }

      if (this._validationLevel !== ExportValidationLevel.NONE) {
        await this._validateExport();
      }

      if (this._enablePerformanceMonitoring) {
        this._metadata.loadTime = performance.now() - startTime;
        this._metadata.memoryUsage = this._estimateMemoryUsage();
      }

      this._updateAccessStats();
      return this._module;
    } catch (error) {
      this._metadata.errorCount++;
      this._metadata.lastError = error instanceof Error ? error.message : String(error);
      throw new ExportValidationError(`Failed to load package: ${error}`, this._packageName);
    }
  }

  /**
   *
   * @example
   */
  private async _dynamicImport(): Promise<any> {
    // Dynamic import for ES modules
    return await import(/* @vite-ignore */ this._packageName);
  }

  /**
   *
   * @example
   */
  private async _validateExport(): Promise<void> {
    if (!this._module) {
      throw new ExportValidationError(t("core.errors.moduleIsNull"), this._packageName);
    }

    if (this._validationLevel >= ExportValidationLevel.BASIC) {
      if (typeof this._module !== "object" || this._module === null) {
        throw new ExportValidationError(t("core.errors.invalidModuleStructure"), this._packageName);
      }
    }
  }

  /**
   *
   * @example
   */
  private _updateAccessStats(): void {
    this._metadata.accessCount++;
    this._metadata.lastAccess = Date.now();
  }

  /**
   *
   * @example
   */
  private _estimateMemoryUsage(): number {
    // Simple memory estimation based on module size
    return JSON.stringify(this._module).length * 2; // Rough estimate
  }

  /**
   *
   * @example
   */
  getMetadata(): ExportMetadata {
    return { ...this._metadata };
  }

  /**
   *
   * @example
   */
  reset(): void {
    this._module = null;
    this._metadata.loadTime = undefined;
    this._metadata.lastAccess = undefined;
    this._metadata.memoryUsage = undefined;
  }
}
