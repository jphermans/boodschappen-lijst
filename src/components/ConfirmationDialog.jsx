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
          iconColor: 'text-red-500',
          confirmButton: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
          border: 'border-red-200'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-500',
          confirmButton: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
          border: 'border-yellow-200'
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-blue-500',
          confirmButton: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
          border: 'border-blue-200'
        };
    }
  };

  const typeStyles = getTypeStyles();
  const IconComponent = typeStyles.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          className={`relative w-full max-w-md bg-[rgb(var(--card-bg))] rounded-2xl shadow-2xl border ${typeStyles.border} overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center space-x-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-[rgb(var(--border-color))]/10 flex items-center justify-center ${typeStyles.iconColor}`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[rgb(var(--card-text))] mb-1">
                  {title}
                </h3>
                <p className="text-sm text-[rgb(var(--text-color))]/70 leading-relaxed">
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--border-color))]/30 flex items-center justify-center text-[rgb(var(--text-color))]/60 hover:text-[rgb(var(--card-text))] transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Actions */}
          <div className="px-6 pb-6">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--border-color))]/30 text-[rgb(var(--card-text))] rounded-xl font-medium transition-all duration-200 hover:scale-105"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-4 py-3 ${typeStyles.confirmButton} text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2`}
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