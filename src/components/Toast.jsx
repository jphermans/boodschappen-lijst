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
        return 'bg-green-500/90 text-white backdrop-blur-sm';
      case 'error':
        return 'bg-red-500/90 text-white backdrop-blur-sm';
      case 'warning':
        return 'bg-orange-500/90 text-white backdrop-blur-sm';
      case 'info':
        return 'bg-blue-500/90 text-white backdrop-blur-sm';
      case 'delete':
        return 'bg-red-600/90 text-white backdrop-blur-sm';
      default:
        return 'bg-gray-600/90 text-white backdrop-blur-sm';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg border border-white/20 ${getStyles()} max-w-xs sm:max-w-sm lg:max-w-md mx-auto mb-2`}
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

export default ToastContainer; 