/**
 * Performance Monitoring Utilities
 * Provides comprehensive performance tracking and optimization tools
 */

import React from 'react';

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENABLE_PERF_MONITORING === 'true';
    this.thresholds = {
      renderTime: 16, // 60fps target
      componentMount: 100,
      apiCall: 1000,
      bundleSize: 250 * 1024, // 250KB
      memoryUsage: 50 * 1024 * 1024 // 50MB
    };
    
    if (this.isEnabled) {
      this.initializeObservers();
    }
  }

  /**
   * Initialize performance observers
   */
  initializeObservers() {
    // Performance Observer for navigation and resource timing
    if ('PerformanceObserver' in window) {
      try {
        // Long Task Observer
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('longTask', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
            
            if (entry.duration > 50) {
              console.warn(`🐌 Long task detected: ${entry.duration.toFixed(2)}ms`);
            }
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longTask', longTaskObserver);
      } catch (e) {
        console.warn('Long task observer not supported');
      }

      // Layout Shift Observer
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              this.recordMetric('layoutShift', {
                value: entry.value,
                startTime: entry.startTime,
                sources: entry.sources
              });
            }
          }
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('layoutShift', layoutShiftObserver);
      } catch (e) {
        console.warn('Layout shift observer not supported');
      }

      // Largest Contentful Paint Observer
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('largestContentfulPaint', {
            value: lastEntry.startTime,
            element: lastEntry.element?.tagName,
            url: lastEntry.url
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }
    }

    // Memory usage monitoring
    if ('memory' in performance) {
      setInterval(() => {
        this.recordMemoryUsage();
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name, data) {
    if (!this.isEnabled) return;

    const timestamp = performance.now();
    const metric = {
      name,
      timestamp,
      data,
      id: `${name}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name);
    metrics.push(metric);

    // Keep only last 100 entries per metric type
    if (metrics.length > 100) {
      metrics.shift();
    }

    // Check thresholds and warn if exceeded
    this.checkThresholds(name, data);
  }

  /**
   * Check performance thresholds
   */
  checkThresholds(name, data) {
    const value = typeof data === 'object' ? data.value || data.duration : data;
    const threshold = this.thresholds[name];

    if (threshold && value > threshold) {
      console.warn(`⚠️ Performance threshold exceeded for ${name}: ${value} > ${threshold}`);
    }
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      this.recordMetric('memoryUsage', {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      });
    }
  }

  /**
   * Measure component render time
   */
  measureRender(componentName, renderFn) {
    if (!this.isEnabled) return renderFn();

    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    this.recordMetric('componentRender', {
      component: componentName,
      duration,
      startTime,
      endTime
    });

    return result;
  }

  /**
   * Measure async operation
   */
  async measureAsync(operationName, asyncFn) {
    if (!this.isEnabled) return await asyncFn();

    const startTime = performance.now();
    try {
      const result = await asyncFn();
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.recordMetric('asyncOperation', {
        operation: operationName,
        duration,
        startTime,
        endTime,
        success: true
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.recordMetric('asyncOperation', {
        operation: operationName,
        duration,
        startTime,
        endTime,
        success: false,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Mark performance milestone
   */
  mark(name, data = {}) {
    if (!this.isEnabled) return;

    performance.mark(name);
    this.recordMetric('milestone', {
      name,
      timestamp: performance.now(),
      ...data
    });
  }

  /**
   * Measure time between two marks
   */
  measure(name, startMark, endMark) {
    if (!this.isEnabled) return;

    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      
      this.recordMetric('measurement', {
        name,
        duration: measure.duration,
        startTime: measure.startTime
      });
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
    }
  }

  /**
   * Get performance summary
   */
  getSummary() {
    if (!this.isEnabled) return null;

    const summary = {};
    
    for (const [metricName, metrics] of this.metrics.entries()) {
      if (metrics.length === 0) continue;

      const values = metrics.map(m => {
        const data = m.data;
        return typeof data === 'object' ? (data.duration || data.value || 0) : data;
      }).filter(v => typeof v === 'number' && !isNaN(v));

      if (values.length === 0) continue;

      summary[metricName] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        p95: this.percentile(values, 0.95),
        p99: this.percentile(values, 0.99),
        recent: metrics.slice(-10).map(m => ({
          timestamp: m.timestamp,
          data: m.data
        }))
      };
    }

    return summary;
  }

  /**
   * Calculate percentile
   */
  percentile(values, p) {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] || 0;
  }

  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals() {
    const summary = this.getSummary();
    if (!summary) return null;

    return {
      // Largest Contentful Paint (should be < 2.5s)
      lcp: summary.largestContentfulPaint?.recent?.[0]?.data?.value || null,
      
      // Cumulative Layout Shift (should be < 0.1)
      cls: summary.layoutShift ? 
        summary.layoutShift.recent.reduce((sum, entry) => sum + (entry.data?.value || 0), 0) : null,
      
      // First Input Delay (measured separately)
      fid: null, // Would need separate measurement
      
      // Custom metrics
      avgRenderTime: summary.componentRender?.avg || null,
      longTaskCount: summary.longTask?.count || 0,
      memoryUsage: summary.memoryUsage?.recent?.[0]?.data?.percentage || null
    };
  }

  /**
   * Export performance data
   */
  exportData() {
    if (!this.isEnabled) return null;

    return {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: Object.fromEntries(this.metrics),
      summary: this.getSummary(),
      coreWebVitals: this.getCoreWebVitals(),
      thresholds: this.thresholds
    };
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// React-specific performance utilities
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  const MonitoredComponent = React.forwardRef((props, ref) => {
    return performanceMonitor.measureRender(
      componentName || WrappedComponent.displayName || WrappedComponent.name,
      () => React.createElement(WrappedComponent, { ...props, ref })
    );
  });

  MonitoredComponent.displayName = `withPerformanceMonitoring(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;
  return MonitoredComponent;
};

// Hook for performance monitoring
export const usePerformanceMonitoring = (componentName) => {
  const measureRender = React.useCallback((renderFn) => {
    return performanceMonitor.measureRender(componentName, renderFn);
  }, [componentName]);

  const measureAsync = React.useCallback((operationName, asyncFn) => {
    return performanceMonitor.measureAsync(`${componentName}.${operationName}`, asyncFn);
  }, [componentName]);

  const mark = React.useCallback((name, data) => {
    performanceMonitor.mark(`${componentName}.${name}`, data);
  }, [componentName]);

  return {
    measureRender,
    measureAsync,
    mark,
    getSummary: () => performanceMonitor.getSummary(),
    getCoreWebVitals: () => performanceMonitor.getCoreWebVitals()
  };
};

// Performance budget checker
export const checkPerformanceBudget = () => {
  const summary = performanceMonitor.getSummary();
  if (!summary) return { passed: true, violations: [] };

  const violations = [];
  const budgets = {
    avgRenderTime: 16, // 60fps
    maxRenderTime: 50,
    avgAsyncOperation: 1000,
    maxMemoryUsage: 80, // percentage
    maxLayoutShifts: 0.1
  };

  // Check render time budget
  if (summary.componentRender) {
    if (summary.componentRender.avg > budgets.avgRenderTime) {
      violations.push({
        metric: 'avgRenderTime',
        actual: summary.componentRender.avg,
        budget: budgets.avgRenderTime,
        severity: 'warning'
      });
    }
    if (summary.componentRender.max > budgets.maxRenderTime) {
      violations.push({
        metric: 'maxRenderTime',
        actual: summary.componentRender.max,
        budget: budgets.maxRenderTime,
        severity: 'error'
      });
    }
  }

  // Check memory usage budget
  if (summary.memoryUsage) {
    const maxMemory = Math.max(...summary.memoryUsage.recent.map(m => m.data?.percentage || 0));
    if (maxMemory > budgets.maxMemoryUsage) {
      violations.push({
        metric: 'maxMemoryUsage',
        actual: maxMemory,
        budget: budgets.maxMemoryUsage,
        severity: 'warning'
      });
    }
  }

  return {
    passed: violations.length === 0,
    violations,
    summary
  };
};

// Development performance dashboard
export const logPerformanceDashboard = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const summary = performanceMonitor.getSummary();
  const coreWebVitals = performanceMonitor.getCoreWebVitals();
  const budget = checkPerformanceBudget();

  console.group('🚀 Performance Dashboard');
  
  if (coreWebVitals) {
    console.group('📊 Core Web Vitals');
    console.log('LCP (Largest Contentful Paint):', coreWebVitals.lcp ? `${coreWebVitals.lcp.toFixed(2)}ms` : 'N/A');
    console.log('CLS (Cumulative Layout Shift):', coreWebVitals.cls ? coreWebVitals.cls.toFixed(4) : 'N/A');
    console.log('Average Render Time:', coreWebVitals.avgRenderTime ? `${coreWebVitals.avgRenderTime.toFixed(2)}ms` : 'N/A');
    console.log('Long Task Count:', coreWebVitals.longTaskCount);
    console.log('Memory Usage:', coreWebVitals.memoryUsage ? `${coreWebVitals.memoryUsage.toFixed(1)}%` : 'N/A');
    console.groupEnd();
  }

  if (summary) {
    console.group('📈 Performance Summary');
    Object.entries(summary).forEach(([metric, data]) => {
      console.log(`${metric}:`, {
        count: data.count,
        avg: `${data.avg.toFixed(2)}ms`,
        p95: `${data.p95.toFixed(2)}ms`,
        max: `${data.max.toFixed(2)}ms`
      });
    });
    console.groupEnd();
  }

  if (budget.violations.length > 0) {
    console.group('⚠️ Performance Budget Violations');
    budget.violations.forEach(violation => {
      console.warn(`${violation.metric}: ${violation.actual.toFixed(2)} > ${violation.budget} (${violation.severity})`);
    });
    console.groupEnd();
  } else {
    console.log('✅ All performance budgets passed');
  }

  console.groupEnd();
};

export default performanceMonitor;