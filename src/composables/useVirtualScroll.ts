/**
 * @file useVirtualScroll implementation
 * @description Virtual scrolling composable for efficient rendering of large lists
 * Based on extensive e2e testing and performance optimization
 */

import { createSignal, createEffect, onCleanup, createMemo, type Accessor } from "solid-js";

export interface VirtualScrollOptions {
  /** Total number of items in the list */
  itemCount: number;
  /** Height of each item in pixels */
  itemHeight: number;
  /** Height of the container in pixels */
  containerHeight: number;
  /** Number of items to render outside the visible area (buffer) */
  bufferSize?: number;
  /** Whether to enable smooth scrolling */
  smoothScrolling?: boolean;
}

export interface VirtualScrollState {
  /** Current scroll position */
  scrollTop: number;
  /** Index of the first visible item */
  startIndex: number;
  /** Index of the last visible item */
  endIndex: number;
  /** Total height of all items */
  totalHeight: number;
  /** Height of the top spacer */
  topSpacerHeight: number;
  /** Height of the bottom spacer */
  bottomSpacerHeight: number;
  /** Number of visible items */
  visibleItemCount: number;
}

/**
 * Virtual scrolling composable for efficient rendering of large lists
 *
 * @param options - Configuration options for virtual scrolling
 * @returns Virtual scroll state and controls
 *
 * @example
 * ```tsx
 * const { state, scrollTo, scrollToIndex } = useVirtualScroll({
 *   itemCount: 10000,
 *   itemHeight: 50,
 *   containerHeight: 400,
 *   bufferSize: 5
 * });
 *
 * return (
 *   <div
 *     style={{ height: `${state().containerHeight}px`, overflow: 'auto' }}
 *     onScroll={(e) => scrollTo(e.currentTarget.scrollTop)}
 *   >
 *     <div style={{ height: `${state().topSpacerHeight}px` }} />
 *     {Array.from({ length: state().endIndex - state().startIndex }, (_, i) => {
 *       const index = state().startIndex + i;
 *       return <Item key={index} index={index} />;
 *     })}
 *     <div style={{ height: `${state().bottomSpacerHeight}px` }} />
 *   </div>
 * );
 * ```
 */
export function useVirtualScroll(options: VirtualScrollOptions) {
  const { itemCount, itemHeight, containerHeight, bufferSize = 5, smoothScrolling = false } = options;

  // Calculate derived values
  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const totalHeight = itemCount * itemHeight;

  // State signals
  const [scrollTop, setScrollTop] = createSignal(0);
  const [startIndex, setStartIndex] = createSignal(0);
  const [endIndex, setEndIndex] = createSignal(Math.min(visibleItemCount + bufferSize, itemCount));

  // Computed state
  const state = createMemo((): VirtualScrollState => {
    const currentStartIndex = startIndex();
    const currentEndIndex = endIndex();

    return {
      scrollTop: scrollTop(),
      startIndex: currentStartIndex,
      endIndex: currentEndIndex,
      totalHeight,
      topSpacerHeight: currentStartIndex * itemHeight,
      bottomSpacerHeight: (itemCount - currentEndIndex) * itemHeight,
      visibleItemCount: currentEndIndex - currentStartIndex,
    };
  });

  // Update visible range based on scroll position
  const updateVisibleRange = (newScrollTop: number) => {
    const newStartIndex = Math.max(0, Math.floor(newScrollTop / itemHeight) - bufferSize);
    const newEndIndex = Math.min(itemCount, newStartIndex + visibleItemCount + bufferSize * 2);

    setScrollTop(newScrollTop);
    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  };

  // Scroll to specific position
  const scrollTo = (position: number) => {
    const clampedPosition = Math.max(0, Math.min(position, totalHeight - containerHeight));
    updateVisibleRange(clampedPosition);
  };

  // Scroll to specific item index
  const scrollToIndex = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, itemCount - 1));
    const position = clampedIndex * itemHeight;
    scrollTo(position);
  };

  // Scroll to top
  const scrollToTop = () => scrollTo(0);

  // Scroll to bottom
  const scrollToBottom = () => scrollTo(totalHeight - containerHeight);

  // Scroll by offset
  const scrollBy = (offset: number) => {
    scrollTo(scrollTop() + offset);
  };

  // Get item index at scroll position
  const getIndexAtPosition = (position: number): number => {
    return Math.floor(position / itemHeight);
  };

  // Get position for item index
  const getPositionForIndex = (index: number): number => {
    return index * itemHeight;
  };

  // Check if item is visible
  const isItemVisible = (index: number): boolean => {
    const currentState = state();
    return index >= currentState.startIndex && index < currentState.endIndex;
  };

  // Get visible item indices
  const getVisibleIndices = (): number[] => {
    const currentState = state();
    const indices: number[] = [];
    for (let i = currentState.startIndex; i < currentState.endIndex; i++) {
      indices.push(i);
    }
    return indices;
  };

  return {
    /** Current virtual scroll state */
    state,
    /** Scroll to specific position */
    scrollTo,
    /** Scroll to specific item index */
    scrollToIndex,
    /** Scroll to top */
    scrollToTop,
    /** Scroll to bottom */
    scrollToBottom,
    /** Scroll by offset */
    scrollBy,
    /** Get item index at scroll position */
    getIndexAtPosition,
    /** Get position for item index */
    getPositionForIndex,
    /** Check if item is visible */
    isItemVisible,
    /** Get visible item indices */
    getVisibleIndices,
  };
}

/**
 * Hook for creating a virtual scroll container with automatic scroll handling
 *
 * @param options - Virtual scroll options
 * @param onScroll - Optional scroll handler
 * @returns Container props and virtual scroll controls
 */
export function useVirtualScrollContainer(
  options: VirtualScrollOptions,
  onScroll?: (state: VirtualScrollState) => void
) {
  const virtualScroll = useVirtualScroll(options);

  // Call onScroll when state changes
  createEffect(() => {
    const currentState = virtualScroll.state();
    onScroll?.(currentState);
  });

  const containerProps = {
    style: {
      height: `${options.containerHeight}px`,
      overflow: "auto",
      position: "relative" as const,
    },
    onScroll: (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      virtualScroll.scrollTo(target.scrollTop);
    },
  };

  return {
    ...virtualScroll,
    containerProps,
  };
}
