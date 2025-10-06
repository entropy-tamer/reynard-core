# Enhanced Async Rate Limiting Utilities

🦊 _whiskers twitch with strategic cunning_ This module provides enhanced async debounce and throttle utilities built on top of the algorithms package for maximum performance and consistency.

## Overview

The enhanced async rate limiting utilities combine the sophisticated features of the algorithms package with modern async/await patterns, AbortController support, and comprehensive Promise handling.

## Key Features

### 🚀 **Built on Algorithms Package**

- Leverages the battle-tested synchronous throttle/debounce from `reynard-algorithms`
- Consistent behavior and performance across sync/async boundaries
- High-resolution timing with `performance.now()`

### ⚡ **Advanced Async Support**

- Full Promise-based API with proper error handling
- AbortController integration for modern cancellation patterns
- Promise-aware state management

### 🎛️ **Comprehensive Options**

- **Leading/Trailing Edge**: Control when functions execute
- **MaxWait**: Ensure execution within time limits
- **AbortSignal**: Modern cancellation support
- **Cancel/Flush**: Fine-grained control methods

### 🔧 **Enhanced Control Methods**

- `cancel()`: Cancel pending operations
- `flush()`: Execute immediately
- `isPending()`: Check operation status

## Quick Start

```typescript
import { debounce, throttle, createAbortController } from "reynard-core/utils/async";

// Basic async debounce
const debouncedSave = debounce(async data => {
  await saveToServer(data);
}, 500);

// Advanced configuration
const throttledUpdate = throttle(
  async value => {
    await updateUI(value);
  },
  100,
  {
    leading: true,
    trailing: true,
    maxWait: 1000,
    abortSignal: createAbortController().signal,
  }
);

// Usage
await debouncedSave({ id: 1, name: "test" });
await throttledUpdate(42);
```

## API Reference

### `debounce<TArgs, TReturn>(fn, wait, options?)`

Debounces an async function, ensuring it only executes after the specified delay has passed since the last invocation.

**Parameters:**

- `fn`: Async function to debounce
- `wait`: Delay in milliseconds
- `options`: Configuration options

**Options:**

- `leading?: boolean` - Execute on leading edge (default: false)
- `trailing?: boolean` - Execute on trailing edge (default: true)
- `maxWait?: number` - Maximum wait time before execution
- `abortSignal?: AbortSignal` - AbortController signal for cancellation

**Returns:** `AsyncDebouncedFunction<TArgs, TReturn>`

### `throttle<TArgs, TReturn>(fn, wait, options?)`

Throttles an async function, ensuring it executes at most once per specified interval.

**Parameters:**

- `fn`: Async function to throttle
- `wait`: Minimum delay between executions
- `options`: Configuration options

**Options:**

- `leading?: boolean` - Execute on leading edge (default: true)
- `trailing?: boolean` - Execute on trailing edge (default: true)
- `maxWait?: number` - Maximum wait time before execution
- `abortSignal?: AbortSignal` - AbortController signal for cancellation

**Returns:** `AsyncThrottledFunction<TArgs, TReturn>`

### Control Methods

Both debounced and throttled functions provide these control methods:

- `cancel()`: Cancel any pending execution
- `flush()`: Execute immediately if pending
- `isPending()`: Check if operation is pending

### AbortController Utilities

- `createAbortController()`: Create a new AbortController
- `createTimeoutAbortController(timeoutMs)`: Create timeout-based controller
- `combineAbortSignals(signals)`: Combine multiple abort signals

## Usage Patterns

### Search Input Debouncing

```typescript
const searchAPI = async (query: string) => {
  const response = await fetch(`/api/search?q=${query}`);
  return response.json();
};

const debouncedSearch = debounce(searchAPI, 300);

// In your component
const handleSearch = async (query: string) => {
  try {
    const results = await debouncedSearch(query);
    setSearchResults(results);
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Search failed:", error);
    }
  }
};
```

### Scroll Event Throttling

```typescript
const updateScrollPosition = async (position: number) => {
  // Update DOM elements
  document.querySelector(".scroll-indicator").textContent = position.toString();
};

const throttledScroll = throttle(updateScrollPosition, 16); // ~60fps

window.addEventListener("scroll", event => {
  throttledScroll(window.scrollY);
});
```

### Form Auto-Save with Cancellation

```typescript
class AutoSaveForm {
  private debouncedSave: ReturnType<typeof debounce>;
  private abortController: AbortController | null = null;

  constructor() {
    this.debouncedSave = debounce(this.save.bind(this), 1000);
  }

  private async save(data: FormData): Promise<void> {
    await fetch("/api/save", {
      method: "POST",
      body: data,
    });
  }

  handleInput(data: FormData): void {
    // Cancel previous save
    if (this.abortController) {
      this.abortController.abort();
    }

    // Create new abort controller
    this.abortController = createAbortController();

    // Update debounced function
    this.debouncedSave = debounce(this.save.bind(this), 1000, {
      abortSignal: this.abortController.signal,
    });

    this.debouncedSave(data);
  }
}
```

## Performance Benefits

### 🎯 **Strategic Integration**

- Built on proven algorithms package foundation
- Consistent timing behavior across sync/async boundaries
- High-resolution timing with `performance.now()`

### ⚡ **Optimized Promise Handling**

- Efficient promise reuse and cleanup
- Proper error propagation and cancellation
- Memory leak prevention through cleanup

### 🔧 **Modern Async Patterns**

- AbortController integration for cancellation
- Promise-based API for better error handling
- TypeScript generics for type safety

## Migration from Basic Implementation

The enhanced version is backward compatible with the basic implementation:

```typescript
// Old way (still works)
const basicDebounce = debounce(asyncFn, 500);

// New way with enhanced features
const enhancedDebounce = debounce(asyncFn, 500, {
  leading: true,
  trailing: true,
  maxWait: 2000,
  abortSignal: controller.signal,
});
```

## Testing

Comprehensive test suite included with examples for:

- Basic debounce/throttle functionality
- Advanced configuration options
- AbortController integration
- Error handling scenarios
- Performance monitoring

## Examples

See `examples/rate-limiting-examples.ts` for comprehensive usage examples including:

- Search components
- Form auto-save
- Scroll handlers
- Performance monitoring
- Real-world integration patterns

---

🦊 _tail flicks with satisfaction_ The enhanced async rate limiting utilities provide the perfect blend of performance, flexibility, and modern async patterns. Built on the solid foundation of the algorithms package, they offer enterprise-grade reliability with cutting-edge features!
