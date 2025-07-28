import React from 'react';
import { motion } from 'framer-motion';
import { X, Palette, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SettingsModal = ({ onClose }) => {
  const {
    theme,
    toggleTheme,
    primaryColor,
    secondaryColor,
    accentColor,
    updateColor,
    resetColors,
  } = useTheme();

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
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Instellingen
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Thema
            </h3>
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-3 p-3 w-full rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="text-gray-900 dark:text-white">
                {theme === 'light' ? 'Donker thema' : 'Licht thema'}
              </span>
            </button>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Kleuren aanpassen
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primaire kleur
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateColor('primary', color.value)}
                      className={`w-full h-10 rounded-lg border-2 transition-all ${
                        primaryColor === color.value
                          ? 'border-gray-900 dark:border-white scale-110'
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
                  className="mt-2 w-full h-10 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secundaire kleur
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateColor('secondary', color.value)}
                      className={`w-full h-10 rounded-lg border-2 transition-all ${
                        secondaryColor === color.value
                          ? 'border-gray-900 dark:border-white scale-110'
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
                  className="mt-2 w-full h-10 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accentkleur
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateColor('accent', color.value)}
                      className={`w-full h-10 rounded-lg border-2 transition-all ${
                        accentColor === color.value
                          ? 'border-gray-900 dark:border-white scale-110'
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
                  className="mt-2 w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={resetColors}
              className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Kleuren resetten naar standaard
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400"
            >
              Device ID: {localStorage.getItem('boodschappenlijst_device_uid')?.substring(0, 8)}...
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsModal;