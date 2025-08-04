import React, { useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info, Trash2 } from 'lucide-react';
import { ToastType, EventHandlerType } from '../types';
import { usePerformanceMonitoring } from '../utils/performanceMonitor';

const Toast = React.memo(({ toast, onRemove }) => {
  const { measureRender } = usePerformanceMonitoring('Toast');
  const { id, type, message, duration = 2500 } = toast;

  // Memoized remove handler
  const handleRemove = useCallback(() => {
    onRemove(id);
  }, [onRemove, id]);

  useEffect(() => {
    const timer = setTimeout(handleRemove, duration);
    return () => clearTimeout(timer);
  }, [handleRemove, duration]);

  // Memoized icon component
  const IconComponent = useMemo(() => {
    const iconProps = { className: "w-full h-full" };
    switch (type) {
      case 'success':
        return <Check {...iconProps} />;
      case 'error':
        return <X {...iconProps} />;
      case 'warning':
        return <AlertCircle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      case 'delete':
        return <Trash2 {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  }, [type]);

  // Memoized styles
  const toastStyles = useMemo(() => {
    const baseStyle = {
      color: 'white',
      backdropFilter: 'blur(4px)'
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(34, 197, 94, 0.9)' // green-500 with 90% opacity
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(239, 68, 68, 0.9)' // red-500 with 90% opacity
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(249, 115, 22, 0.9)' // orange-500 with 90% opacity
        };
      case 'info':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(59, 130, 246, 0.9)' // blue-500 with 90% opacity
        };
      case 'delete':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(220, 38, 38, 0.9)' // red-600 with 90% opacity
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: 'rgba(75, 85, 99, 0.9)' // gray-600 with 90% opacity
        };
    }
  }, [type]);

  return measureRender(() => (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      style={toastStyles}
      className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg border border-white/20 max-w-xs sm:max-w-sm lg:max-w-md mx-auto mb-2`}
    >
      <div className="flex-shrink-0">
        <div className="w-4 h-4 sm:w-5 sm:h-5">
          {IconComponent}
        </div>
      </div>
      <p className="flex-1 font-medium text-xs sm:text-sm lg:text-base">{message}</p>
      <button
        onClick={handleRemove}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
    </motion.div>
  ));
});

// Display name for debugging
Toast.displayName = 'Toast';

// PropTypes for Toast component
Toast.propTypes = {
  toast: ToastType.isRequired,
  onRemove: EventHandlerType.isRequired
};

const ToastContainer = React.memo(({ toasts, removeToast }) => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});

// Display name for debugging
ToastContainer.displayName = 'ToastContainer';

// PropTypes for ToastContainer component
ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(ToastType).isRequired,
  removeToast: EventHandlerType.isRequired
};

export { Toast };
export default ToastContainer;