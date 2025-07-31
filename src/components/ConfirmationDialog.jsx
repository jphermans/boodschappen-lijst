import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check } from 'lucide-react';

const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Bevestigen", 
  cancelText = "Annuleren",
  type = "danger" // "danger", "warning", "info"
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: AlertTriangle,
          iconColor: 'text-[rgb(var(--error-color))]',
          confirmButton: 'bg-[rgb(var(--error-color))] hover:opacity-90',
          border: 'border-[rgb(var(--error-color))]/20'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-[rgb(var(--warning-color))]',
          confirmButton: 'bg-[rgb(var(--warning-color))] hover:opacity-90',
          border: 'border-[rgb(var(--warning-color))]/20'
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-[rgb(var(--info-color))]',
          confirmButton: 'bg-[rgb(var(--info-color))] hover:opacity-90',
          border: 'border-[rgb(var(--info-color))]/20'
        };
    }
  };

  const typeStyles = getTypeStyles();
  const IconComponent = typeStyles.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className={`relative w-full max-w-sm sm:max-w-md bg-[rgb(var(--card-bg))] rounded-xl sm:rounded-2xl shadow-2xl border ${typeStyles.border} overflow-hidden mx-2 sm:mx-0`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 pb-3 sm:pb-4">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[rgb(var(--border-color))]/10 flex items-center justify-center ${typeStyles.iconColor}`}>
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-[rgb(var(--card-text))] mb-1 break-words">
                  {title}
                </h3>
                <p className="text-sm text-[rgb(var(--text-color))]/70 leading-relaxed break-words">
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--border-color))]/30 flex items-center justify-center text-[rgb(var(--text-color))]/60 hover:text-[rgb(var(--card-text))] transition-all duration-200 touch-manipulation"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
          
          {/* Actions */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={onClose}
                className="w-full sm:flex-1 px-4 py-3 sm:py-3 bg-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--border-color))]/30 text-[rgb(var(--card-text))] rounded-lg sm:rounded-xl font-medium transition-all duration-200 touch-manipulation active:scale-95 sm:hover:scale-105 text-sm sm:text-base"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`w-full sm:flex-1 px-4 py-3 sm:py-3 ${typeStyles.confirmButton} text-white rounded-lg sm:rounded-xl font-medium transition-all duration-200 touch-manipulation active:scale-95 sm:hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm sm:text-base`}
              >
                <Check className="w-4 h-4" />
                <span>{confirmText}</span>
              </button>
            </div>
          </div>
          
          {/* Theme-aware gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--primary-color))]/5 via-transparent to-[rgb(var(--secondary-color))]/5 pointer-events-none" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationDialog;