/**
 * Bundle Optimization Utilities
 * Provides tools for analyzing and optimizing bundle size and code splitting
 */

import { lazy } from 'react';

/**
 * Bundle size analyzer for development
 */
class BundleAnalyzer {
  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development';
    this.chunks = new Map();
    this.loadTimes = new Map();
    this.errors = new Map();
  }

  /**
   * Track chunk loading
   */
  trackChunkLoad(chunkName, startTime) {
    if (!this.isEnabled) return;

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    this.loadTimes.set(chunkName, {
      loadTime,
      timestamp: Date.now(),
      size: this.estimateChunkSize(chunkName)
    });

    if (loadTime > 1000) {
      console.warn(`🐌 Slow chunk load: ${chunkName} took ${loadTime.toFixed(2)}ms`);
    }
  }

  /**
   * Track chunk loading errors
   */
  trackChunkError(chunkName, error) {
    if (!this.isEnabled) return;

    this.errors.set(chunkName, {
      error: error.message,
      timestamp: Date.now(),
      stack: error.stack
    });

    console.error(`❌ Chunk load failed: ${chunkName}`, error);
  }

  /**
   * Estimate chunk size (rough approximation)
   */
  estimateChunkSize(chunkName) {
    // This is a rough estimation - in a real app you'd get this from webpack stats
    const sizeEstimates = {
      'pages': 50000,      // ~50KB
      'components': 30000, // ~30KB
      'utils': 20000,      // ~20KB
      'vendor': 200000     // ~200KB
    };

    for (const [key, size] of Object.entries(sizeEstimates)) {
      if (chunkName.includes(key)) {
        return size;
      }
    }

    return 25000; // Default ~25KB
  }

  /**
   * Get bundle analysis report
   */
  getReport() {
    if (!this.isEnabled) return null;

    const chunks = Array.from(this.loadTimes.entries()).map(([name, data]) => ({
      name,
      ...data,
      sizeKB: (data.size / 1024).toFixed(1),
      loadTimeMs: data.loadTime.toFixed(2)
    }));

    const errors = Array.from(this.errors.entries()).map(([name, data]) => ({
      name,
      ...data
    }));

    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const avgLoadTime = chunks.length > 0 
      ? chunks.reduce((sum, chunk) => sum + chunk.loadTime, 0) / chunks.length 
      : 0;

    return {
      chunks,
      errors,
      summary: {
        totalChunks: chunks.length,
        totalSizeKB: (totalSize / 1024).toFixed(1),
        avgLoadTimeMs: avgLoadTime.toFixed(2),
        errorCount: errors.length,
        slowChunks: chunks.filter(chunk => chunk.loadTime > 1000).length
      }
    };
  }

  /**
   * Log bundle report to console
   */
  logReport() {
    if (!this.isEnabled) return;

    const report = this.getReport();
    if (!report) return;

    console.group('📦 Bundle Analysis Report');
    
    console.group('📊 Summary');
    console.table(report.summary);
    console.groupEnd();

    if (report.chunks.length > 0) {
      console.group('📋 Chunks');
      console.table(report.chunks);
      console.groupEnd();
    }

    if (report.errors.length > 0) {
      console.group('❌ Errors');
      console.table(report.errors);
      console.groupEnd();
    }

    console.groupEnd();
  }
}

// Create singleton instance
const bundleAnalyzer = new BundleAnalyzer();

/**
 * Enhanced lazy loading with performance tracking
 */
export const createLazyComponent = (importFunction, chunkName) => {
  const startTime = performance.now();

  return lazy(async () => {
    try {
      const module = await importFunction();
      bundleAnalyzer.trackChunkLoad(chunkName, startTime);
      return module;
    } catch (error) {
      bundleAnalyzer.trackChunkError(chunkName, error);
      throw error;
    }
  });
};

/**
 * Preload chunks for better performance
 */
export const preloadChunk = async (importFunction, chunkName) => {
  if (typeof importFunction !== 'function') {
    console.warn(`Invalid import function for chunk: ${chunkName}`);
    return;
  }

  const startTime = performance.now();

  try {
    await importFunction();
    bundleAnalyzer.trackChunkLoad(`preload-${chunkName}`, startTime);
  } catch (error) {
    bundleAnalyzer.trackChunkError(`preload-${chunkName}`, error);
  }
};

/**
 * Intelligent preloading based on user behavior
 */
export const createIntelligentPreloader = () => {
  const preloadQueue = new Set();
  const preloadedChunks = new Set();
  let isPreloading = false;

  const preloadNext = async () => {
    if (isPreloading || preloadQueue.size === 0) return;

    isPreloading = true;
    const { importFunction, chunkName } = preloadQueue.values().next().value;
    preloadQueue.delete({ importFunction, chunkName });

    try {
      await preloadChunk(importFunction, chunkName);
      preloadedChunks.add(chunkName);
    } catch (error) {
      console.warn(`Failed to preload chunk: ${chunkName}`, error);
    } finally {
      isPreloading = false;
      // Continue with next chunk
      setTimeout(preloadNext, 100);
    }
  };

  return {
    queue: (importFunction, chunkName, priority = 'normal') => {
      if (preloadedChunks.has(chunkName)) return;

      preloadQueue.add({ importFunction, chunkName, priority });
      
      // Start preloading if not already running
      if (!isPreloading) {
        // Delay preloading to not interfere with critical rendering
        setTimeout(preloadNext, priority === 'high' ? 100 : 1000);
      }
    },
    
    getStatus: () => ({
      queued: preloadQueue.size,
      preloaded: preloadedChunks.size,
      isPreloading
    })
  };
};

/**
 * Bundle size monitoring
 */
export const monitorBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') return;

  // Monitor resource loading
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          const sizeKB = entry.transferSize ? (entry.transferSize / 1024).toFixed(1) : 'unknown';
          const loadTime = entry.duration.toFixed(2);
          
          console.log(`📦 Resource loaded: ${entry.name.split('/').pop()} (${sizeKB}KB, ${loadTime}ms)`);
          
          // Warn about large resources
          if (entry.transferSize > 100 * 1024) { // > 100KB
            console.warn(`⚠️ Large resource detected: ${entry.name} (${sizeKB}KB)`);
          }
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }
};

/**
 * Code splitting recommendations
 */
export const analyzeSplittingOpportunities = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const recommendations = [];

  // Check for large vendor bundles
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  scripts.forEach(script => {
    const src = script.src;
    if (src.includes('vendor') || src.includes('chunk')) {
      recommendations.push({
        type: 'vendor-splitting',
        message: `Consider splitting vendor bundle: ${src.split('/').pop()}`,
        priority: 'medium'
      });
    }
  });

  // Check for unused CSS
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  stylesheets.forEach(link => {
    recommendations.push({
      type: 'css-optimization',
      message: `Consider critical CSS extraction for: ${link.href.split('/').pop()}`,
      priority: 'low'
    });
  });

  if (recommendations.length > 0) {
    console.group('💡 Code Splitting Recommendations');
    recommendations.forEach(rec => {
      const emoji = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      console.log(`${emoji} ${rec.message}`);
    });
    console.groupEnd();
  }

  return recommendations;
};

/**
 * Performance budget checker for bundles
 */
export const checkBundleBudget = () => {
  const budgets = {
    totalJS: 250 * 1024,      // 250KB total JS
    totalCSS: 50 * 1024,      // 50KB total CSS
    chunkSize: 100 * 1024,    // 100KB per chunk
    loadTime: 3000            // 3s total load time
  };

  const violations = [];
  let totalJSSize = 0;
  let totalCSSSize = 0;

  // Check resource sizes
  if ('performance' in window && 'getEntriesByType' in performance) {
    const resources = performance.getEntriesByType('resource');
    
    resources.forEach(resource => {
      if (resource.name.includes('.js')) {
        totalJSSize += resource.transferSize || 0;
        
        if (resource.transferSize > budgets.chunkSize) {
          violations.push({
            type: 'chunk-size',
            resource: resource.name.split('/').pop(),
            actual: resource.transferSize,
            budget: budgets.chunkSize,
            severity: 'warning'
          });
        }
      } else if (resource.name.includes('.css')) {
        totalCSSSize += resource.transferSize || 0;
      }
    });
  }

  // Check total sizes
  if (totalJSSize > budgets.totalJS) {
    violations.push({
      type: 'total-js',
      actual: totalJSSize,
      budget: budgets.totalJS,
      severity: 'error'
    });
  }

  if (totalCSSSize > budgets.totalCSS) {
    violations.push({
      type: 'total-css',
      actual: totalCSSSize,
      budget: budgets.totalCSS,
      severity: 'warning'
    });
  }

  return {
    passed: violations.length === 0,
    violations,
    summary: {
      totalJSKB: (totalJSSize / 1024).toFixed(1),
      totalCSSKB: (totalCSSSize / 1024).toFixed(1),
      budgetUtilization: {
        js: ((totalJSSize / budgets.totalJS) * 100).toFixed(1) + '%',
        css: ((totalCSSSize / budgets.totalCSS) * 100).toFixed(1) + '%'
      }
    }
  };
};

/**
 * Initialize bundle optimization monitoring
 */
export const initializeBundleOptimization = () => {
  if (process.env.NODE_ENV !== 'development') return;

  console.log('🚀 Bundle optimization monitoring initialized');
  
  // Start monitoring
  monitorBundleSize();
  
  // Check budgets periodically
  setTimeout(() => {
    const budgetCheck = checkBundleBudget();
    if (!budgetCheck.passed) {
      console.warn('⚠️ Bundle budget violations detected:', budgetCheck.violations);
    }
    
    analyzeSplittingOpportunities();
    bundleAnalyzer.logReport();
  }, 5000);
};

export {
  bundleAnalyzer,
  BundleAnalyzer
};

export default {
  createLazyComponent,
  preloadChunk,
  createIntelligentPreloader,
  monitorBundleSize,
  analyzeSplittingOpportunities,
  checkBundleBudget,
  initializeBundleOptimization,
  bundleAnalyzer
};