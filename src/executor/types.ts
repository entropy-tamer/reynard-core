/**
 * @file Type definitions for executor
 */

/**
 * Executor Types
 *
 * TypeScript interfaces for the backend thread pool executor system.
 */

export enum ExecutorState {
  IDLE = "idle",
  RUNNING = "running",
  SHUTTING_DOWN = "shutting_down",
  SHUTDOWN = "shutdown",
}

export interface ExecutorConfig {
  maxWorkers?: number;
  enablePerformanceMonitoring?: boolean;
  autoCleanup?: boolean;
  defaultTimeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface ExecutorStats {
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageExecutionTime: number;
  totalExecutionTime: number;
  maxConcurrentTasks: number;
  currentConcurrentTasks: number;
}

export interface TaskInfo {
  taskId: string;
  functionName: string;
  startTime: number;
  timeout: number;
  retryCount: number;
  maxRetries: number;
}

export interface ExecutorAPI {
  // Executor management
  initialize(): Promise<boolean>;
  shutdown(wait?: boolean): Promise<void>;

  // Task execution
  execute<T>(fn: () => T, timeout?: number, retries?: number): Promise<T>;

  executeBatch<T>(tasks: Array<() => T>, maxConcurrent?: number): Promise<T[]>;

  // Status and monitoring
  getStats(): Promise<ExecutorStats>;
  getActiveTasks(): Promise<TaskInfo[]>;
  getState(): Promise<ExecutorState>;
}
