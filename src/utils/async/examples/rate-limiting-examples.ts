/**
 * Enhanced Async Rate Limiting Examples
 *
 * Comprehensive examples demonstrating the enhanced async debounce and throttle
 * functionality built on top of the algorithms package.
 */

import {
  debounce,
  throttle,
  createAbortController,
  createTimeoutAbortController,
  combineAbortSignals,
  PrecisionTier,
  type AsyncDebouncedFunction,
} from "../rate-limiting";

// ============================================================================
// BASIC USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Basic Async Debounce
 * Perfect for search inputs, API calls, and form submissions
 */
export async function basicDebounceExample() {
  // Simulate an API call
  const searchAPI = async (query: string): Promise<string[]> => {
    console.log(`Searching for: ${query}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [`Result for ${query}`];
  };

  // Create debounced search function
  const debouncedSearch = debounce(searchAPI, 300, { precision: PrecisionTier.HIGH }) as AsyncDebouncedFunction<
    [string],
    string[]
  >;

  // Multiple rapid calls - only the last one executes
  const results1 = await debouncedSearch("hello");
  const results2 = await debouncedSearch("world");
  const results3 = await debouncedSearch("typescript");

  console.log("Search results:", results3);
  // Output: Searching for: typescript
  //        Search results: ['Result for typescript']
}

/**
 * Example 2: Basic Async Throttle
 * Perfect for scroll handlers, resize events, and real-time updates
 */
export async function basicThrottleExample() {
  // Simulate a scroll handler
  const updateScrollPosition = async (position: number): Promise<void> => {
    console.log(`Updating scroll position: ${position}`);
    // Simulate DOM update
    await new Promise(resolve => setTimeout(resolve, 50));
  };

  // Create throttled scroll handler
  const throttledScroll = throttle(updateScrollPosition, 100);

  // Multiple rapid calls - executes at most once per 100ms
  await throttledScroll(100);
  await throttledScroll(200);
  await throttledScroll(300);

  console.log("Scroll updates completed");
}

// ============================================================================
// ADVANCED CONFIGURATION EXAMPLES
// ============================================================================

/**
 * Example 3: Leading Edge Debounce
 * Executes immediately on first call, then debounces subsequent calls
 */
export async function leadingEdgeDebounceExample() {
  const saveToServer = async (data: any): Promise<void> => {
    console.log("Saving to server:", data);
    await new Promise(resolve => setTimeout(resolve, 200));
  };

  // Leading edge debounce - saves immediately, then debounces
  const debouncedSave = debounce(saveToServer, 500, {
    leading: true,
    trailing: false,
  });

  // First call executes immediately
  await debouncedSave({ id: 1, name: "First" });

  // Subsequent calls are ignored
  await debouncedSave({ id: 2, name: "Second" });
  await debouncedSave({ id: 3, name: "Third" });

  console.log("Leading edge save completed");
}

/**
 * Example 4: MaxWait Debounce
 * Ensures function executes at least once within maxWait time
 */
export async function maxWaitDebounceExample() {
  const processData = async (data: string): Promise<string> => {
    console.log("Processing data:", data);
    await new Promise(resolve => setTimeout(resolve, 100));
    return `Processed: ${data}`;
  };

  // MaxWait ensures processing happens at least every 2 seconds
  const debouncedProcess = debounce(processData, 500, {
    maxWait: 2000,
  });

  // Continuous rapid calls
  for (let i = 0; i < 10; i++) {
    debouncedProcess(`data-${i}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log("MaxWait processing completed");
}

/**
 * Example 5: Throttle with Leading and Trailing
 * Executes immediately and also after the delay period
 */
export async function leadingTrailingThrottleExample() {
  const updateUI = async (value: number): Promise<void> => {
    console.log(`Updating UI with value: ${value}`);
    await new Promise(resolve => setTimeout(resolve, 50));
  };

  // Leading and trailing throttle
  const throttledUpdate = throttle(updateUI, 200, {
    leading: true,
    trailing: true,
  });

  // Multiple rapid calls
  await throttledUpdate(1);
  await throttledUpdate(2);
  await throttledUpdate(3);

  console.log("Leading and trailing updates completed");
}

// ============================================================================
// ABORTCONTROLLER EXAMPLES
// ============================================================================

/**
 * Example 6: AbortController Integration
 * Cancel operations when needed
 */
export async function abortControllerExample() {
  const longRunningTask = async (taskId: string): Promise<string> => {
    console.log(`Starting task: ${taskId}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `Completed: ${taskId}`;
  };

  // Create abort controller
  const controller = createAbortController();
  const debouncedTask = debounce(longRunningTask, 100, {
    abortSignal: controller.signal,
  });

  // Start the task
  const promise = debouncedTask("important-task");

  // Cancel after 500ms
  setTimeout(() => {
    console.log("Cancelling task...");
    controller.abort();
  }, 500);

  try {
    const result = await promise;
    console.log("Task result:", result);
  } catch (error) {
    console.log("Task was cancelled:", (error as Error).message);
  }
}

/**
 * Example 7: Timeout-based AbortController
 * Automatically cancel after a timeout
 */
export async function timeoutAbortControllerExample() {
  const slowAPI = async (endpoint: string): Promise<any> => {
    console.log(`Calling API: ${endpoint}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { data: "API response" };
  };

  // Auto-cancel after 1 second
  const controller = createTimeoutAbortController(1000);
  const debouncedAPI = debounce(slowAPI, 100, {
    abortSignal: controller.signal,
  });

  try {
    const result = await debouncedAPI("/slow-endpoint");
    console.log("API result:", result);
  } catch (error) {
    console.log("API call timed out:", (error as Error).message);
  }
}

/**
 * Example 8: Combined AbortSignals
 * Cancel when any of multiple conditions are met
 */
export async function combinedAbortSignalsExample() {
  const dataProcessor = async (data: any): Promise<any> => {
    console.log("Processing data:", data);
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { processed: data };
  };

  // Create multiple abort controllers
  const userController = createAbortController();
  const timeoutController = createTimeoutAbortController(1000);

  // Combine them - abort if either user cancels OR timeout occurs
  const combinedController = combineAbortSignals([userController.signal, timeoutController.signal]);

  const debouncedProcessor = debounce(dataProcessor, 100, {
    abortSignal: combinedController.signal,
  });

  // Simulate user cancellation after 500ms
  setTimeout(() => {
    console.log("User cancelled operation");
    userController.abort();
  }, 500);

  try {
    const result = await debouncedProcessor({ id: 1, value: "test" });
    console.log("Processing result:", result);
  } catch (error) {
    console.log("Processing was cancelled:", (error as Error).message);
  }
}

// ============================================================================
// CONTROL METHODS EXAMPLES
// ============================================================================

/**
 * Example 9: Cancel and Flush Methods
 * Fine-grained control over debounced/throttled functions
 */
export async function controlMethodsExample() {
  const expensiveOperation = async (input: string): Promise<string> => {
    console.log(`Expensive operation on: ${input}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return `Result: ${input}`;
  };

  const debouncedOp = debounce(expensiveOperation, 500, { precision: PrecisionTier.HIGH }) as AsyncDebouncedFunction<
    [string],
    string
  >;

  // Start operation
  const promise = debouncedOp("initial-data");

  // Check if pending
  console.log("Is pending:", debouncedOp.isPending()); // true

  // Cancel the operation
  debouncedOp.cancel();
  console.log("Is pending after cancel:", debouncedOp.isPending()); // false

  try {
    await promise;
  } catch (error) {
    console.log("Operation was cancelled:", (error as Error).message);
  }

  // Start new operation and flush it immediately
  debouncedOp("new-data");
  const result = await debouncedOp.flush();
  console.log("Flushed result:", result);
}

/**
 * Example 10: Real-world Search Component
 * Complete example of a search component with debouncing
 */
export class SearchComponent {
  private debouncedSearch: AsyncDebouncedFunction<[string], SearchResult[]>;
  private abortController: AbortController | null = null;

  constructor() {
    this.debouncedSearch = debounce(this.performSearch.bind(this), 300, {
      precision: PrecisionTier.HIGH,
    }) as AsyncDebouncedFunction<[string], SearchResult[]>;
  }

  private async performSearch(query: string): Promise<SearchResult[]> {
    console.log(`Searching for: "${query}"`);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));

    return [
      { id: 1, title: `Result 1 for ${query}`, relevance: 0.9 },
      { id: 2, title: `Result 2 for ${query}`, relevance: 0.8 },
      { id: 3, title: `Result 3 for ${query}`, relevance: 0.7 },
    ];
  }

  async search(query: string): Promise<SearchResult[]> {
    // Cancel previous search if still pending
    if (this.abortController) {
      this.abortController.abort();
    }

    // Create new abort controller for this search
    this.abortController = createAbortController();

    // Update debounced function with new abort signal
    this.debouncedSearch = debounce(this.performSearch.bind(this), 300, {
      abortSignal: this.abortController.signal,
      precision: PrecisionTier.HIGH,
    }) as AsyncDebouncedFunction<[string], SearchResult[]>;

    try {
      const result = await this.debouncedSearch(query);
      return result || [];
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Search was cancelled");
        return [];
      }
      throw error;
    }
  }

  cancelSearch(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.debouncedSearch.cancel();
  }

  isSearching(): boolean {
    return this.debouncedSearch.isPending();
  }
}

interface SearchResult {
  id: number;
  title: string;
  relevance: number;
}

// ============================================================================
// PERFORMANCE MONITORING EXAMPLE
// ============================================================================

/**
 * Example 11: Performance Monitoring
 * Monitor the performance of debounced/throttled operations
 */
export async function performanceMonitoringExample() {
  const monitoredOperation = async (data: any): Promise<any> => {
    const start = performance.now();

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 100));

    const end = performance.now();
    console.log(`Operation took ${end - start}ms`);

    return { processed: data, duration: end - start };
  };

  const debouncedOp = debounce(monitoredOperation, 200);

  // Multiple rapid calls
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(debouncedOp({ id: i, value: `data-${i}` }));
  }

  const results = await Promise.all(promises);
  console.log("All operations completed:", results.length);
}

// ============================================================================
// EXPORT ALL EXAMPLES
// ============================================================================

export const examples = {
  basicDebounceExample,
  basicThrottleExample,
  leadingEdgeDebounceExample,
  maxWaitDebounceExample,
  leadingTrailingThrottleExample,
  abortControllerExample,
  timeoutAbortControllerExample,
  combinedAbortSignalsExample,
  controlMethodsExample,
  performanceMonitoringExample,
};
