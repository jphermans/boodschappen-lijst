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
        return <Check className="w-5 h-5" />;
      case 'error':
        return <X className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'delete':
        return <Trash2 className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-[rgb(var(--success-color))] text-white';
      case 'error':
        return 'bg-[rgb(var(--error-color))] text-white';
      case 'warning':
        return 'bg-[rgb(var(--warning-color))] text-white';
      case 'info':
        return 'bg-[rgb(var(--info-color))] text-white';
      case 'delete':
        return 'bg-[rgb(var(--accent-color))] text-white';
      default:
        return 'bg-[rgb(var(--border-color))] text-[rgb(var(--card-text))]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg ${getStyles()} max-w-sm mx-auto mb-2`}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <p className="flex-1 font-medium text-sm">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
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