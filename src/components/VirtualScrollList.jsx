import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { usePerformanceMonitoring } from '../utils/performanceMonitor';

/**
 * VirtualScrollList - High-performance virtual scrolling component
 * Only renders visible items to maintain performance with large datasets
 */
const VirtualScrollList = React.memo(({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  getItemKey,
  estimatedItemHeight
}) => {
  const { measureRender, measureAsync } = usePerformanceMonitoring('VirtualScrollList');
  const scrollElementRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollingTimeoutRef = useRef(null);

  // Use estimated height if provided, otherwise use fixed height
  const getItemHeight = useCallback((index) => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index);
    }
    return itemHeight || estimatedItemHeight || 50;
  }, [itemHeight, estimatedItemHeight]);

  // Calculate total height and visible range
  const { totalHeight, startIndex, endIndex, visibleItems } = useMemo(() => {
    if (!items.length) {
      return {
        totalHeight: 0,
        startIndex: 0,
        endIndex: 0,
        visibleItems: []
      };
    }

    let totalH = 0;
    const itemHeights = [];
    
    // Calculate cumulative heights
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      itemHeights.push(totalH);
      totalH += height;
    }

    // Find visible range
    let start = 0;
    let end = items.length - 1;

    // Binary search for start index
    let low = 0;
    let high = items.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (itemHeights[mid] < scrollTop) {
        start = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // Find end index
    const viewportBottom = scrollTop + containerHeight;
    for (let i = start; i < items.length; i++) {
      if (itemHeights[i] > viewportBottom) {
        end = i - 1;
        break;
      }
    }

    // Apply overscan
    const overscanStart = Math.max(0, start - overscan);
    const overscanEnd = Math.min(items.length - 1, end + overscan);

    // Create visible items with positioning
    const visible = [];
    for (let i = overscanStart; i <= overscanEnd; i++) {
      visible.push({
        index: i,
        item: items[i],
        top: itemHeights[i],
        height: getItemHeight(i)
      });
    }

    return {
      totalHeight: totalH,
      startIndex: overscanStart,
      endIndex: overscanEnd,
      visibleItems: visible
    };
  }, [items, scrollTop, containerHeight, overscan, getItemHeight]);

  // Handle scroll events
  const handleScroll = useCallback(async (event) => {
    const newScrollTop = event.target.scrollTop;
    
    await measureAsync('scroll', async () => {
      setScrollTop(newScrollTop);
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }

      // Set scrolling to false after scroll ends
      scrollingTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      // Call external scroll handler
      if (onScroll) {
        onScroll(event, {
          scrollTop: newScrollTop,
          startIndex,
          endIndex,
          isScrolling: true
        });
      }
    });
  }, [measureAsync, onScroll, startIndex, endIndex]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
    };
  }, []);

  // Scroll to specific item
  const scrollToItem = useCallback((index, align = 'auto') => {
    if (!scrollElementRef.current || index < 0 || index >= items.length) {
      return;
    }

    let targetScrollTop = 0;
    for (let i = 0; i < index; i++) {
      targetScrollTop += getItemHeight(i);
    }

    const itemHeight = getItemHeight(index);
    const currentScrollTop = scrollElementRef.current.scrollTop;
    const containerH = containerHeight;

    let newScrollTop = targetScrollTop;

    switch (align) {
      case 'start':
        newScrollTop = targetScrollTop;
        break;
      case 'end':
        newScrollTop = targetScrollTop - containerH + itemHeight;
        break;
      case 'center':
        newScrollTop = targetScrollTop - (containerH - itemHeight) / 2;
        break;
      case 'auto':
      default:
        // Only scroll if item is not visible
        if (targetScrollTop < currentScrollTop) {
          newScrollTop = targetScrollTop;
        } else if (targetScrollTop + itemHeight > currentScrollTop + containerH) {
          newScrollTop = targetScrollTop - containerH + itemHeight;
        } else {
          return; // Item is already visible
        }
        break;
    }

    scrollElementRef.current.scrollTo({
      top: Math.max(0, Math.min(newScrollTop, totalHeight - containerH)),
      behavior: 'smooth'
    });
  }, [items.length, getItemHeight, containerHeight, totalHeight]);

  // Expose scroll methods via ref
  React.useImperativeHandle(scrollElementRef, () => ({
    scrollToItem,
    scrollToTop: () => scrollElementRef.current?.scrollTo({ top: 0, behavior: 'smooth' }),
    scrollToBottom: () => scrollElementRef.current?.scrollTo({ 
      top: totalHeight - containerHeight, 
      behavior: 'smooth' 
    }),
    getScrollPosition: () => ({
      scrollTop,
      startIndex,
      endIndex,
      isScrolling
    })
  }), [scrollToItem, totalHeight, containerHeight, scrollTop, startIndex, endIndex, isScrolling]);

  return measureRender(() => (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((virtualItem) => {
          const key = getItemKey ? getItemKey(virtualItem.item, virtualItem.index) : virtualItem.index;
          
          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                top: virtualItem.top,
                height: virtualItem.height,
                width: '100%'
              }}
            >
              {renderItem(virtualItem.item, virtualItem.index, {
                isScrolling,
                isVisible: true
              })}
            </div>
          );
        })}
      </div>
    </div>
  ));
});

VirtualScrollList.displayName = 'VirtualScrollList';

VirtualScrollList.propTypes = {
  items: PropTypes.array.isRequired,
  itemHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  containerHeight: PropTypes.number.isRequired,
  renderItem: PropTypes.func.isRequired,
  overscan: PropTypes.number,
  className: PropTypes.string,
  onScroll: PropTypes.func,
  getItemKey: PropTypes.func,
  estimatedItemHeight: PropTypes.number
};

VirtualScrollList.defaultProps = {
  overscan: 5,
  className: '',
  estimatedItemHeight: 50
};

/**
 * Hook for managing virtual scroll state
 */
export const useVirtualScroll = (items, options = {}) => {
  const {
    itemHeight = 50,
    containerHeight = 400,
    overscan = 5
  } = options;

  const [scrollState, setScrollState] = useState({
    scrollTop: 0,
    startIndex: 0,
    endIndex: 0,
    isScrolling: false
  });

  const handleScroll = useCallback((event, state) => {
    setScrollState(state);
  }, []);

  const scrollToItem = useCallback((scrollRef, index, align = 'auto') => {
    if (scrollRef.current?.scrollToItem) {
      scrollRef.current.scrollToItem(index, align);
    }
  }, []);

  return {
    scrollState,
    handleScroll,
    scrollToItem,
    visibleRange: {
      start: scrollState.startIndex,
      end: scrollState.endIndex
    }
  };
};

/**
 * Performance-optimized list item wrapper
 */
export const VirtualListItem = React.memo(({ 
  children, 
  index, 
  isScrolling, 
  placeholder 
}) => {
  // Show placeholder during fast scrolling to improve performance
  if (isScrolling && placeholder) {
    return placeholder;
  }

  return children;
});

VirtualListItem.displayName = 'VirtualListItem';

VirtualListItem.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.number.isRequired,
  isScrolling: PropTypes.bool,
  placeholder: PropTypes.node
};

export default VirtualScrollList;