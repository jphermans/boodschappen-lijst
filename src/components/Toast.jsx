import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info, Trash2 } from 'lucide-react';

const Toast = ({ toast, onRemove }) => {
  const { id, type, message, duration = 2500 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-full h-full" />;
      case 'error':
        return <X className="w-full h-full" />;
      case 'warning':
        return <AlertCircle className="w-full h-full" />;
      case 'info':
        return <Info className="w-full h-full" />;
      case 'delete':
        return <Trash2 className="w-full h-full" />;
      default:
        return <Info className="w-full h-full" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.9)', // green-500 with 90% opacity
          color: 'white',
          backdropFilter: 'blur(4px)'
        };
      case 'error':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.9)', // red-500 with 90% opacity
          color: 'white',
          backdropFilter: 'blur(4px)'
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(249, 115, 22, 0.9)', // orange-500 with 90% opacity
          color: 'white',
          backdropFilter: 'blur(4px)'
        };
      case 'info':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.9)', // blue-500 with 90% opacity
          color: 'white',
          backdropFilter: 'blur(4px)'
        };
      case 'delete':
        return {
          backgroundColor: 'rgba(220, 38, 38, 0.9)', // red-600 with 90% opacity
          color: 'white',
          backdropFilter: 'blur(4px)'
        };
      default:
        return {
          backgroundColor: 'rgba(75, 85, 99, 0.9)', // gray-600 with 90% opacity
          color: 'white',
          backdropFilter: 'blur(4px)'
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      style={getStyles()}
      className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg border border-white/20 max-w-xs sm:max-w-sm lg:max-w-md mx-auto mb-2`}
    >
      <div className="flex-shrink-0">
        <div className="w-4 h-4 sm:w-5 sm:h-5">
          {getIcon()}
        </div>
      </div>
      <p className="flex-1 font-medium text-xs sm:text-sm lg:text-base">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>
    </motion.div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
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
};

export { Toast };
export default ToastContainer;