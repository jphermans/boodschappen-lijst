// Color picker component for unified theme customization
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Color palette preview component
function PalettePreview({ palette, isActive, onClick, disabled = false }) {
  const colorKeys = ['primary', 'secondary', 'accent'];
  
  return (
    <motion.button
      onClick={() => !disabled && onClick(palette.key)}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200
        ${isActive
          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Palette name */}
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
        {palette.name}
      </div>

      {/* Color swatches */}
      <div className="flex space-x-1">
        {colorKeys.map(colorKey => {
          const color = palette.colors[colorKey] || '#6b7280';
          return (
            <div
              key={colorKey}
              className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: color }}
              title={`${colorKey}: ${color}`}
            />
          );
        })}
      </div>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}

// Main color picker component
export default function ColorPicker({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('palettes');
  const [isChangingPalette, setIsChangingPalette] = useState(false);
  const [currentMode, setCurrentMode] = useState('light');
  const [currentPalette, setCurrentPalette] = useState('Gruvbox');

  // Simple palette data
  const availablePalettes = [
    {
      key: 'gruvbox',
      name: 'Gruvbox',
      colors: {
        primary: '#fe8019',
        secondary: '#b8bb26',
        accent: '#fb4934',
        background: '#fbf1c7',
        surface: '#f2e5bc'
      }
    },
    {
      key: 'ocean',
      name: 'Ocean',
      colors: {
        primary: '#0ea5e9',
        secondary: '#06b6d4',
        accent: '#8b5cf6',
        background: '#f0f9ff',
        surface: '#e0f2fe'
      }
    },
    {
      key: 'sunset',
      name: 'Sunset',
      colors: {
        primary: '#f97316',
        secondary: '#ef4444',
        accent: '#ec4899',
        background: '#fff7ed',
        surface: '#fed7aa'
      }
    }
  ];

  // Handle palette change with direct CSS variable updates
  const handlePaletteChange = useCallback((paletteKey) => {
    const palette = availablePalettes.find(p => p.key === paletteKey);
    if (!palette) return;

    setIsChangingPalette(true);
    setCurrentPalette(palette.name);

    // Apply colors directly to CSS variables
    const root = document.documentElement;
    Object.entries(palette.colors).forEach(([colorKey, hexColor]) => {
      const rgb = hexToRgb(hexColor);
      if (rgb) {
        root.style.setProperty(`--color-${colorKey}`, `${rgb.r} ${rgb.g} ${rgb.b}`);
      }
    });

    setTimeout(() => setIsChangingPalette(false), 500);
  }, [availablePalettes]);

  // Handle mode toggle
  const toggleMode = useCallback(() => {
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    setCurrentMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode);
  }, [currentMode]);

  // Simple hex to RGB converter
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Handle reset theme
  const handleResetTheme = useCallback(() => {
    if (window.confirm('Weet je zeker dat je het thema wilt resetten?')) {
      handlePaletteChange('gruvbox');
      setCurrentMode('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [handlePaletteChange]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-start justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full my-8 flex flex-col max-h-[calc(100vh-4rem)]"
        >
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Thema Aanpassen
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Huidige modus: {currentMode === 'light' ? 'Licht' : 'Donker'} •
                Palet: {currentPalette}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Mode toggle */}
              <button
                onClick={toggleMode}
                disabled={isChangingPalette}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {currentMode === 'light' ? '🌙' : '☀️'}
              </button>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10 touch-manipulation"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            {/* Simplified single content area */}
            <div className="flex-1 p-4 overflow-y-auto overscroll-contain">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    🎨 Kleurpaletten
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availablePalettes.map(palette => (
                      <PalettePreview
                        key={palette.key}
                        palette={palette}
                        isActive={currentPalette === palette.name}
                        onClick={handlePaletteChange}
                        disabled={isChangingPalette}
                      />
                    ))}
                  </div>
                </div>

                {/* Reset theme section */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    ⚙️ Thema Resetten
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Reset terug naar het standaard Gruvbox thema.
                  </p>
                  <button
                    onClick={handleResetTheme}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Thema Resetten
                  </button>
                </div>

                {/* Theme info */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    ℹ️ Thema Informatie
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Huidige modus: {currentMode === 'light' ? 'Licht' : 'Donker'}</p>
                    <p>Actief palet: {currentPalette}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex-shrink-0 border-t border-[rgb(var(--border-color))]/50 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[rgb(var(--text-color))]/60">
                Wijzigingen worden automatisch opgeslagen
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-primary hover:opacity-90 text-white rounded-lg transition-colors"
              >
                Sluiten
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}