/**
 * Lightweight virtualizer — drop-in replacement for @tanstack/react-virtual.
 *
 * Implements scroll-based row windowing with overscan support and
 * optional dynamic element measurement.
 *
 * Bundle impact: ~0.8KB gzip  vs  @tanstack/react-virtual ~2.5KB gzip
 */

import { useState, useEffect, useCallback, useRef } from "react";

export interface VirtualItem {
    index: number;
    start: number;
    end: number;
    size: number;
    key: number;
}

export interface VirtualizerOptions {
    count: number;
    getScrollElement: () => HTMLElement | null;
    estimateSize: (index: number) => number;
    overscan?: number;
    enabled?: boolean;
    measureElement?: ((el: HTMLElement) => number) | undefined;
}

export interface Virtualizer {
    getVirtualItems: () => VirtualItem[];
    getTotalSize: () => number;
    measureElement: (el: HTMLElement | null) => void;
}

export function useVirtualizer(options: VirtualizerOptions): Virtualizer {
    const { count, getScrollElement, estimateSize, overscan = 10, enabled = true } = options;

    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const measuredSizes = useRef<Map<number, number>>(new Map());
    const rafRef = useRef<number | null>(null);

    // Compute sizes and offsets
    const getItemSize = useCallback(
        (index: number) => measuredSizes.current.get(index) ?? estimateSize(index),
        [estimateSize]
    );

    // Attach scroll listener
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const scrollElement = getScrollElement();
        if (!scrollElement) {
            return;
        }

        setContainerHeight(scrollElement.clientHeight);

        const handleScroll = () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
            rafRef.current = requestAnimationFrame(() => {
                setScrollTop(scrollElement.scrollTop);
                setContainerHeight(scrollElement.clientHeight);
            });
        };

        scrollElement.addEventListener("scroll", handleScroll, { passive: true });

        // Also observe resize
        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => {
                setContainerHeight(scrollElement.clientHeight);
            });
            resizeObserver.observe(scrollElement);
        }

        return () => {
            scrollElement.removeEventListener("scroll", handleScroll);
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        };
    }, [enabled, getScrollElement]);

    const getVirtualItems = useCallback((): VirtualItem[] => {
        if (!enabled || count === 0 || containerHeight === 0) {
            // When disabled, return all items
            if (!enabled) {
                const items: VirtualItem[] = [];
                let offset = 0;
                for (let i = 0; i < count; i++) {
                    const size = getItemSize(i);
                    items.push({
                        index: i,
                        start: offset,
                        end: offset + size,
                        size,
                        key: i
                    });
                    offset += size;
                }
                return items;
            }
            return [];
        }

        // Find visible range
        let startIndex = 0;
        let offset = 0;
        for (let i = 0; i < count; i++) {
            const size = getItemSize(i);
            if (offset + size > scrollTop) {
                startIndex = i;
                break;
            }
            offset += size;
            if (i === count - 1) {
                startIndex = count;
            }
        }

        let endIndex = startIndex;
        let endOffset = offset;
        for (let i = startIndex; i < count; i++) {
            const size = getItemSize(i);
            endOffset += size;
            endIndex = i;
            if (endOffset >= scrollTop + containerHeight) {
                break;
            }
        }

        // Apply overscan
        const start = Math.max(0, startIndex - overscan);
        const end = Math.min(count - 1, endIndex + overscan);

        // Build items
        const items: VirtualItem[] = [];
        let itemOffset = 0;
        for (let i = 0; i < start; i++) {
            itemOffset += getItemSize(i);
        }
        for (let i = start; i <= end; i++) {
            const size = getItemSize(i);
            items.push({
                index: i,
                start: itemOffset,
                end: itemOffset + size,
                size,
                key: i
            });
            itemOffset += size;
        }

        return items;
    }, [enabled, count, containerHeight, scrollTop, overscan, getItemSize]);

    const getTotalSize = useCallback((): number => {
        let total = 0;
        for (let i = 0; i < count; i++) {
            total += getItemSize(i);
        }
        return total;
    }, [count, getItemSize]);

    const measureElement = useCallback(
        (el: HTMLElement | null) => {
            if (!el || !options.measureElement) {
                return;
            }
            const index = parseInt(el.getAttribute("data-index") || "0", 10);
            const measuredHeight = options.measureElement(el);
            if (!isNaN(index) && measuredHeight > 0) {
                const currentSize = measuredSizes.current.get(index);
                if (currentSize !== measuredHeight) {
                    measuredSizes.current.set(index, measuredHeight);
                }
            }
        },
        [options.measureElement]
    );

    return {
        getVirtualItems,
        getTotalSize,
        measureElement
    };
}
