import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Palette, Moon, Sun, Link2, BarChart3, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useUnifiedThemeContext } from '../context/UnifiedThemeContext';
import { getDeviceInfo } from '../utils/deviceUID';
import AnalyticsDashboard from './AnalyticsDashboard';
import ColorPicker from './ColorPicker';

const SettingsModal = ({ lists = [], onClose }) => {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Legacy theme context for backward compatibility
  const {
    theme,
    toggleTheme,
    primaryColor,
    secondaryColor,
    accentColor,
    updateColor,
    resetColors,
  } = useTheme();
  
  // New unified theme context
  const {
    mode: unifiedMode,
    currentPalette,
    toggleMode: unifiedToggleMode,
    isLoading: themeLoading,
    error: themeError
  } = useUnifiedThemeContext();
  
  const deviceInfo = getDeviceInfo();

  const presetColors = [
    { name: 'Blauw', value: '#3b82f6' },
    { name: 'Paars', value: '#8b5cf6' },
    { name: 'Roze', value: '#ec4899' },
    { name: 'Groen', value: '#10b981' },
    { name: 'Oranje', value: '#f97316' },
    { name: 'Rood', value: '#ef4444' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Cyaan', value: '#06b6d4' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[rgb(var(--card-bg))] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border-color))]/50">
          <h2 className="text-xl font-semibold text-[rgb(var(--card-text))]">
            Instellingen
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[rgb(var(--border-color))]/20 transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--text-color))]/60" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-[rgb(var(--card-text))] mb-3">
              Thema
            </h3>
            
            <div className="space-y-3">
              {/* Theme toggle */}
              <button
                onClick={unifiedToggleMode}
                disabled={themeLoading}
                className="flex items-center justify-center space-x-3 p-4 w-full rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {unifiedMode === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <span className="font-medium">
                  {unifiedMode === 'light' ? '🌙 Donker thema' : '☀️ Licht thema'}
                </span>
                {themeLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
              </button>

              {/* Current palette info */}
              <div className="bg-[rgb(var(--border-color))]/10 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--card-text))]">
                      Huidig palet: {currentPalette}
                    </p>
                    <p className="text-xs text-[rgb(var(--text-color))]/60">
                      Modus: {unifiedMode === 'light' ? 'Licht' : 'Donker'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowColorPicker(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm font-medium">Aanpassen</span>
                  </button>
                </div>
              </div>

              {/* Error display */}
              {themeError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Thema fout: {themeError.message || 'Onbekende fout'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[rgb(var(--card-text))] mb-3 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Kleuren aanpassen
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-color))]/80 mb-2">
                  Primaire kleur
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateColor('primary', color.value)}
                      className={`w-full h-10 rounded-lg border-2 transition-all ${
                        primaryColor === color.value
                          ? 'border-[rgb(var(--text-color))] scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => updateColor('primary', e.target.value)}
                  className="mt-2 w-full h-10 rounded-lg cursor-pointer border border-[rgb(var(--border-color))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-color))]/80 mb-2">
                  Secundaire kleur
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateColor('secondary', color.value)}
                      className={`w-full h-10 rounded-lg border-2 transition-all ${
                        secondaryColor === color.value
                          ? 'border-[rgb(var(--text-color))] scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => updateColor('secondary', e.target.value)}
                  className="mt-2 w-full h-10 rounded-lg cursor-pointer border border-[rgb(var(--border-color))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-color))]/80 mb-2">
                  Accentkleur
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateColor('accent', color.value)}
                      className={`w-full h-10 rounded-lg border-2 transition-all ${
                        accentColor === color.value
                          ? 'border-[rgb(var(--text-color))] scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => updateColor('accent', e.target.value)}
                  className="mt-2 w-full h-10 rounded-lg cursor-pointer border border-[rgb(var(--border-color))]"
                />
              </div>
            </div>

            <button
              onClick={resetColors}
              className="w-full mt-4 flex items-center justify-center px-4 py-3 bg-[rgb(var(--border-color))]/60 hover:bg-[rgb(var(--border-color))]/80 text-[rgb(var(--card-text))] rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Palette className="w-5 h-5 mr-2" />
              <span className="font-medium">Kleuren resetten naar standaard</span>
            </button>
          </div>

          <div className="pt-4 border-t border-[rgb(var(--border-color))]/50 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-[rgb(var(--card-text))] mb-3 flex items-center">
                <Link2 className="w-5 h-5 mr-2" />
                Lijsten delen
              </h3>
              
              <div className="space-y-3">
                <div className="bg-[rgb(var(--border-color))]/10 p-4 rounded-lg">
                  <p className="text-sm text-[rgb(var(--text-color))]/80 mb-2">
                    <strong>Hoe lijsten delen:</strong>
                  </p>
                  <div className="space-y-1 text-xs text-[rgb(var(--text-color))]/70">
                    <p>• Klik op "Delen" bij een lijst</p>
                    <p>• Deel de QR-code of link met anderen</p>
                    <p>• Anderen kunnen de QR-code scannen of de link openen</p>
                    <p>• De lijst verschijnt automatisch in hun overzicht</p>
                  </div>
                </div>
                
                <div className="bg-[rgb(var(--border-color))]/10 p-4 rounded-lg">
                  <p className="text-sm text-[rgb(var(--text-color))]/80 mb-2">
                    <strong>Gebruiker ID:</strong>
                  </p>
                  <p className="text-xs text-[rgb(var(--text-color))]/60 font-mono">
                    {deviceInfo.deviceId.substring(0, 12)}...
                  </p>
                  <p className="text-xs text-[rgb(var(--text-color))]/60 mt-1">
                    Dit ID wordt automatisch gebruikt voor het delen van lijsten
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[rgb(var(--border-color))]/50">
            <div>
              <h3 className="text-lg font-medium text-[rgb(var(--card-text))] mb-3 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics & Statistieken
              </h3>
              
              <div className="space-y-3">
                <div className="bg-[rgb(var(--border-color))]/10 p-4 rounded-lg">
                  <p className="text-sm text-[rgb(var(--text-color))]/80 mb-3">
                    Bekijk gedetailleerde statistieken over je lijsten, delen-activiteit en gebruikspatronen.
                  </p>
                  
                  <button
                    onClick={() => setShowAnalytics(true)}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    <span className="font-medium">Open Analytics Dashboard</span>
                  </button>
                </div>
                
                {lists.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/10 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-primary">{lists.length}</div>
                      <div className="text-xs text-[rgb(var(--text-color))]/60">Totaal lijsten</div>
                    </div>
                    <div className="bg-secondary/10 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-secondary">
                        {lists.filter(list => list.isCreator).length}
                      </div>
                      <div className="text-xs text-[rgb(var(--text-color))]/60">Eigenaar van</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {showAnalytics && (
        <AnalyticsDashboard
          lists={lists}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </motion.div>
  );
};

export default SettingsModal;