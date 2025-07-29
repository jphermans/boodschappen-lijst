// Color picker component for unified theme customization
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnifiedTheme, useColorAccessibility, useCustomColors } from '../hooks/useUnifiedTheme';
import { colorUtils } from '../utils/colorManager';

// Individual color input component
function ColorInput({ 
  label, 
  colorKey, 
  value, 
  onChange, 
  onValidation,
  disabled = false,
  showAccessibility = true 
}) {
  const [inputValue, setInputValue] = useState(value || '#6b7280');
  const [isValid, setIsValid] = useState(true);
  const [validation, setValidation] = useState(null);
  const { validateColor, getContrastRatio } = useColorAccessibility();
  const inputRef = useRef(null);

  // Update input when value changes externally
  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Validate color on change
  useEffect(() => {
    const validateCurrentColor = async () => {
      if (!inputValue || inputValue.length < 7) {
        setIsValid(false);
        setValidation(null);
        return;
      }

      try {
        const result = validateColor(colorKey, inputValue);
        setIsValid(result.valid);
        setValidation(result);
        
        if (onValidation) {
          onValidation(colorKey, result);
        }
      } catch (error) {
        console.error('Color validation error:', error);
        setIsValid(false);
        setValidation({ valid: false, reason: 'Validation error' });
      }
    };

    const debounceTimer = setTimeout(validateCurrentColor, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue, colorKey, validateColor, onValidation]);

  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.length === 7 && newValue.startsWith('#')) {
      onChange(colorKey, newValue);
    }
  }, [colorKey, onChange]);

  const handleColorPickerChange = useCallback((e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(colorKey, newValue);
  }, [colorKey, onChange]);

  const getAccessibilityIcon = () => {
    if (!validation || !showAccessibility) return null;
    
    if (validation.valid) {
      return (
        <div className="flex items-center text-green-600 dark:text-green-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-red-600 dark:text-red-400" title={validation.reason}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <div className="flex items-center space-x-3">
        {/* Color preview and picker */}
        <div className="relative">
          <input
            type="color"
            value={inputValue}
            onChange={handleColorPickerChange}
            disabled={disabled}
            className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            title="Klik om kleur te kiezen"
          />
          <div 
            className="absolute inset-0 rounded-lg border-2 pointer-events-none"
            style={{ 
              borderColor: isValid ? 'transparent' : '#ef4444',
              backgroundColor: inputValue 
            }}
          />
        </div>

        {/* Hex input */}
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            disabled={disabled}
            placeholder="#6b7280"
            className={`w-full px-3 py-2 border rounded-lg font-mono text-sm
              ${isValid 
                ? 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400' 
                : 'border-red-500 dark:border-red-400'
              }
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          />
        </div>

        {/* Accessibility indicator */}
        {getAccessibilityIcon()}
      </div>

      {/* Validation message */}
      <AnimatePresence>
        {validation && !validation.valid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-red-600 dark:text-red-400"
          >
            {validation.reason}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contrast information */}
      {validation && validation.valid && validation.contrastRatio && showAccessibility && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Contrast: {validation.contrastRatio.toFixed(2)}:1
          {validation.meetsAA && (
            <span className="ml-2 text-green-600 dark:text-green-400">✓ AA</span>
          )}
          {validation.meetsAAA && (
            <span className="ml-1 text-green-600 dark:text-green-400">✓ AAA</span>
          )}
        </div>
      )}
    </div>
  );
}

// Color palette preview component
function PalettePreview({ palette, isActive, onClick, disabled = false }) {
  const colorKeys = ['primary', 'secondary', 'accent', 'background', 'surface'];
  
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
              className="w-6 h-6 rounded-md border border-gray-300 dark:border-gray-600"
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
  const { 
    theme, 
    currentMode, 
    currentPalette, 
    availablePalettes,
    setColorPalette,
    toggleMode,
    resetTheme,
    isLoading,
    error 
  } = useUnifiedTheme();
  
  const { 
    customColors, 
    updateCustomColor, 
    removeCustomColor, 
    hasCustomColor,
    getColorSource,
    isUpdating 
  } = useCustomColors();

  const [activeTab, setActiveTab] = useState('palettes');
  const [validationResults, setValidationResults] = useState({});
  const [isChangingPalette, setIsChangingPalette] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Handle palette change
  const handlePaletteChange = useCallback(async (paletteKey) => {
    try {
      setIsChangingPalette(true);
      await setColorPalette(paletteKey);
    } catch (error) {
      console.error('Failed to change palette:', error);
    } finally {
      setIsChangingPalette(false);
    }
  }, [setColorPalette]);

  // Handle custom color change
  const handleCustomColorChange = useCallback(async (colorKey, hexColor) => {
    try {
      await updateCustomColor(colorKey, hexColor);
    } catch (error) {
      console.error('Failed to update custom color:', error);
    }
  }, [updateCustomColor]);

  // Handle color validation
  const handleColorValidation = useCallback((colorKey, validation) => {
    setValidationResults(prev => ({
      ...prev,
      [colorKey]: validation
    }));
  }, []);

  // Handle reset theme
  const handleResetTheme = useCallback(async () => {
    if (window.confirm('Weet je zeker dat je het thema wilt resetten? Alle aangepaste kleuren gaan verloren.')) {
      try {
        await resetTheme();
      } catch (error) {
        console.error('Failed to reset theme:', error);
      }
    }
  }, [resetTheme]);

  // Get color keys for customization
  const getCustomizableColors = () => {
    if (!theme?.palette?.colors) return [];
    
    return Object.keys(theme.palette.colors).filter(key => 
      !key.startsWith('_') && // Skip internal colors
      key !== 'mode' // Skip mode indicator
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
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
                disabled={isLoading}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {currentMode === 'light' ? '🌙' : '☀️'}
              </button>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex h-[calc(90vh-120px)]">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
              <nav className="space-y-2">
                {[
                  { key: 'palettes', label: 'Kleurpaletten', icon: '🎨' },
                  { key: 'custom', label: 'Aangepaste Kleuren', icon: '✏️' },
                  { key: 'accessibility', label: 'Toegankelijkheid', icon: '♿' },
                  { key: 'advanced', label: 'Geavanceerd', icon: '⚙️' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${activeTab === tab.key
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <span>{tab.icon}</span>
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Loading state */}
              {isLoading && (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700 dark:text-red-300 text-sm">
                      {error.message || 'Er is een fout opgetreden'}
                    </span>
                  </div>
                </div>
              )}

              {/* Palettes tab */}
              {activeTab === 'palettes' && !isLoading && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Beschikbare Kleurpaletten
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
                </div>
              )}

              {/* Custom colors tab */}
              {activeTab === 'custom' && !isLoading && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Aangepaste Kleuren
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Pas individuele kleuren aan. Deze overschrijven de kleuren van het geselecteerde palet.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {getCustomizableColors().map(colorKey => {
                        const colorSource = getColorSource(colorKey);
                        return (
                          <div key={colorKey} className="space-y-2">
                            <ColorInput
                              label={colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
                              colorKey={colorKey}
                              value={colorSource.color}
                              onChange={handleCustomColorChange}
                              onValidation={handleColorValidation}
                              disabled={isUpdating}
                            />
                            
                            {hasCustomColor(colorKey) && (
                              <button
                                onClick={() => removeCustomColor(colorKey)}
                                disabled={isUpdating}
                                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                              >
                                Reset naar palet kleur
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Accessibility tab */}
              {activeTab === 'accessibility' && !isLoading && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Toegankelijkheid
                    </h3>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          <p className="font-medium mb-1">WCAG Richtlijnen</p>
                          <p>AA: Minimaal 4.5:1 contrast voor normale tekst</p>
                          <p>AAA: Minimaal 7:1 contrast voor normale tekst</p>
                        </div>
                      </div>
                    </div>

                    {/* Validation results */}
                    <div className="space-y-4">
                      {Object.entries(validationResults).map(([colorKey, validation]) => (
                        <div key={colorKey} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
                            </span>
                            <div className="flex items-center space-x-2">
                              {validation.valid ? (
                                <span className="text-green-600 dark:text-green-400 text-sm">✓ Geldig</span>
                              ) : (
                                <span className="text-red-600 dark:text-red-400 text-sm">✗ Ongeldig</span>
                              )}
                            </div>
                          </div>
                          
                          {validation.contrastRatio && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Contrast: {validation.contrastRatio.toFixed(2)}:1
                              <div className="flex space-x-4 mt-1">
                                <span className={validation.meetsAA ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                  AA: {validation.meetsAA ? '✓' : '✗'}
                                </span>
                                <span className={validation.meetsAAA ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                  AAA: {validation.meetsAAA ? '✓' : '✗'}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {!validation.valid && validation.reason && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                              {validation.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced tab */}
              {activeTab === 'advanced' && !isLoading && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Geavanceerde Instellingen
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Reset theme */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Thema Resetten
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Reset alle aangepaste kleuren en keer terug naar het standaard thema.
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
                          Thema Informatie
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p>Huidige modus: {currentMode === 'light' ? 'Licht' : 'Donker'}</p>
                          <p>Actief palet: {currentPalette}</p>
                          <p>Aangepaste kleuren: {Object.keys(customColors).length}</p>
                          <p>Laatst gewijzigd: {theme?.lastModified ? new Date(theme.lastModified).toLocaleString('nl-NL') : 'Onbekend'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}