import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, Zap, AlertTriangle, CheckCircle, X } from 'lucide-react';
import performanceMonitor, { 
  logPerformanceDashboard, 
  checkPerformanceBudget 
} from '../utils/performanceMonitor';

/**
 * Performance Dashboard - Development tool for monitoring app performance
 * Only renders in development mode
 */
const PerformanceDashboard = React.memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [coreWebVitals, setCoreWebVitals] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      const summary = performanceMonitor.getSummary();
      const vitals = performanceMonitor.getCoreWebVitals();
      const budget = checkPerformanceBudget();

      setMetrics(summary);
      setCoreWebVitals(vitals);
      setBudgetStatus(budget);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Format numbers for display
  const formatNumber = (num, decimals = 2) => {
    if (num === null || num === undefined) return 'N/A';
    return typeof num === 'number' ? num.toFixed(decimals) : num;
  };

  // Format memory usage
  const formatMemory = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Get status color based on performance
  const getStatusColor = (value, threshold, inverted = false) => {
    if (value === null || value === undefined) return 'text-gray-400';
    
    const isGood = inverted ? value < threshold : value > threshold;
    return isGood ? 'text-green-500' : 'text-red-500';
  };

  // Render metric card
  const MetricCard = ({ title, value, unit, threshold, icon: Icon, inverted = false }) => (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-300">{title}</h4>
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex items-baseline space-x-2">
        <span className={`text-2xl font-bold ${getStatusColor(value, threshold, inverted)}`}>
          {formatNumber(value)}
        </span>
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
      </div>
      {threshold && (
        <div className="text-xs text-gray-500 mt-1">
          Target: {inverted ? '<' : '>'} {threshold}{unit}
        </div>
      )}
    </div>
  );

  // Render Core Web Vitals
  const CoreWebVitalsSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center">
        <Zap className="w-5 h-5 mr-2" />
        Core Web Vitals
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="LCP (Largest Contentful Paint)"
          value={coreWebVitals?.lcp}
          unit="ms"
          threshold={2500}
          icon={Clock}
          inverted
        />
        <MetricCard
          title="CLS (Cumulative Layout Shift)"
          value={coreWebVitals?.cls}
          threshold={0.1}
          icon={Activity}
          inverted
        />
        <MetricCard
          title="Memory Usage"
          value={coreWebVitals?.memoryUsage}
          unit="%"
          threshold={80}
          icon={Activity}
          inverted
        />
      </div>
    </div>
  );

  // Render performance metrics
  const PerformanceMetricsSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center">
        <Activity className="w-5 h-5 mr-2" />
        Performance Metrics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Avg Render Time"
          value={metrics?.componentRender?.avg}
          unit="ms"
          threshold={16}
          icon={Clock}
          inverted
        />
        <MetricCard
          title="Max Render Time"
          value={metrics?.componentRender?.max}
          unit="ms"
          threshold={50}
          icon={Clock}
          inverted
        />
        <MetricCard
          title="Long Tasks"
          value={coreWebVitals?.longTaskCount}
          threshold={0}
          icon={AlertTriangle}
          inverted
        />
        <MetricCard
          title="Render Count"
          value={metrics?.componentRender?.count}
          icon={Activity}
        />
      </div>
    </div>
  );

  // Render budget violations
  const BudgetViolationsSection = () => {
    if (!budgetStatus?.violations?.length) {
      return (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center text-green-400">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">All performance budgets passed!</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
          Budget Violations
        </h3>
        <div className="space-y-2">
          {budgetStatus.violations.map((violation, index) => (
            <div
              key={index}
              className={`border rounded-lg p-3 ${
                violation.severity === 'error'
                  ? 'bg-red-900/20 border-red-500/30 text-red-400'
                  : 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{violation.metric}</span>
                <span className="text-sm">
                  {formatNumber(violation.actual)} {'>'} {violation.budget}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render controls
  const ControlsSection = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <label className="text-sm text-gray-300">
          Refresh Interval:
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="ml-2 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
          >
            <option value={1000}>1s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
          </select>
        </label>
        <button
          onClick={() => {
            performanceMonitor.clear();
            setMetrics(null);
            setCoreWebVitals(null);
            setBudgetStatus(null);
          }}
          className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded border border-gray-600"
        >
          Clear Metrics
        </button>
        <button
          onClick={logPerformanceDashboard}
          className="bg-blue-700 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
        >
          Log to Console
        </button>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-gray-400 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <>
      {/* Toggle Button */}
      {!isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setIsVisible(true)}
          className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50 border-2 border-blue-500"
          title="Open Performance Dashboard"
        >
          <Activity className="w-6 h-6" />
        </motion.button>
      )}

      {/* Dashboard Modal */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Activity className="w-7 h-7 mr-3 text-blue-500" />
                    Performance Dashboard
                  </h2>
                  <div className="text-sm text-gray-400">
                    Development Mode Only
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-8">
                <ControlsSection />
                
                {coreWebVitals && <CoreWebVitalsSection />}
                
                {metrics && <PerformanceMetricsSection />}
                
                {budgetStatus && <BudgetViolationsSection />}

                {/* Raw Data Section */}
                {metrics && (
                  <details className="bg-gray-800 rounded-lg border border-gray-700">
                    <summary className="p-4 cursor-pointer text-white font-medium hover:bg-gray-750">
                      Raw Performance Data
                    </summary>
                    <div className="p-4 border-t border-gray-700">
                      <pre className="text-xs text-gray-300 overflow-auto max-h-64 bg-gray-900 p-3 rounded">
                        {JSON.stringify({ metrics, coreWebVitals, budgetStatus }, null, 2)}
                      </pre>
                    </div>
                  </details>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

PerformanceDashboard.displayName = 'PerformanceDashboard';

export default PerformanceDashboard;