/**
 * HuggingFace Cache Types
 *
 * TypeScript interfaces for the backend HuggingFace cache management system.
 */

export interface HFCacheConfig {
  hfHome?: string;
  hfCache?: string;
  defaultCacheDir?: string;
}

export interface HFCacheInfo {
  cacheDir: string;
  hubDir: string;
  size: number;
  modelCount: number;
}

export interface ModelCacheInfo {
  repoId: string;
  cachePath: string;
  snapshotPath: string;
  isCached: boolean;
  size?: number;
  lastModified?: string;
}

export interface HFCacheAPI {
  // Cache directory management
  getCacheDir(): Promise<string>;
  getHubDir(): Promise<string>;
  ensureCacheDir(): Promise<string>;

  // Model cache management
  getModelCachePath(repoId: string): Promise<string>;
  getModelSnapshotPath(repoId: string, revision?: string): Promise<string>;
  isModelCached(repoId: string): Promise<boolean>;

  // Cache operations
  getCacheSize(): Promise<number>;
  clearCache(): Promise<boolean>;
  getCacheInfo(): Promise<HFCacheInfo>;
  getModelInfo(repoId: string): Promise<ModelCacheInfo>;
}
