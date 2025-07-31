import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Palette, Sun, Moon, Check, Download, Upload } from 'lucide-react';
import { useUnifiedThemeContext } from '../context/UnifiedThemeContext';

const ThemePage = ({ onBack }) => {
  const {
    theme,
    mode,
    setColorPalette,
    setMode,
    setCustomColor,
    resetTheme,
    getAvailablePalettes,
    validateColorAccessibility,
    exportTheme,
    importTheme
  } = useUnifiedThemeContext();

  const [selectedTheme, setSelectedTheme] = useState(theme?.palette?.key || 'gruvbox');
  const [showCustomColorEditor, setShowCustomColorEditor] = useState(false);
  const [customColors, setCustomColors] = useState({});
  const [importFile, setImportFile] = useState(null);

  const availableThemes = getAvailablePalettes() || [];
  
  // Use the themes from the unified color manager (now includes fallback handling)
  const displayThemes = availableThemes;

  const handleThemeChange = async (themeKey) => {
    setSelectedTheme(themeKey);
    try {
      await setColorPalette(themeKey);
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  };

  const handleModeToggle = async () => {
    try {
      await setMode(mode === 'light' ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to toggle mode:', error);
    }
  };

  const handleResetTheme = async () => {
    if (window.confirm('Weet je zeker dat je het thema wilt resetten naar standaardinstellingen?')) {
      try {
        await resetTheme();
        setSelectedTheme('gruvbox');
      } catch (error) {
        console.error('Failed to reset theme:', error);
      }
    }
  };

  const handleExportTheme = async () => {
    try {
      const themeData = exportTheme();
      const blob = new Blob([JSON.stringify(themeData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boodschappenlijst-theme-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export theme:', error);
    }
  };

  const handleImportTheme = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const themeData = JSON.parse(text);
      await importTheme(themeData);
    } catch (error) {
      console.error('Failed to import theme:', error);
      alert('Kon thema niet importeren. Controleer het bestand.');
    }
  };

  const renderColorPreview = (themeOption, themeMode) => {
    const colors = themeMode === 'light' && themeOption.lightMode 
      ? themeOption.lightMode 
      : themeOption.colors;
    
    return (
      <div className="grid grid-cols-5 gap-1">
        {Object.entries(colors).slice(0, 5).map(([key, color]) => (
          <div
            key={key}
            className="w-full h-4 rounded-sm"
            style={{ backgroundColor: `rgb(${color})` }}
            title={key}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen-safe bg-[rgb(var(--bg-color))] transition-colors duration-300">
      {/* Safe area background extension */}
      <div className="fixed inset-x-0 top-0 h-[var(--safe-area-inset-top)] bg-[rgb(var(--card-bg))] z-50"></div>
      
      {/* Header */}
      <header className="fixed-top-safe bg-[rgb(var(--card-bg))] shadow-sm border-b border-[rgb(var(--border-color))]/20 header-safe-area">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8 xl:px-12 safe-area-x">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Back Button and Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--border-color))]/30 text-[rgb(var(--card-text))] transition-all duration-200 group"
                aria-label="Terug naar instellingen"
              >
                <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6 group-hover:-translate-x-1 transition-transform duration-200" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-[rgb(var(--card-text))] tracking-tight">
                  Thema Instellingen
                </h1>
                <p className="hidden lg:block text-sm text-[rgb(var(--text-color))]/60 font-medium">
                  Kies je favoriete kleurenschema
                </p>
              </div>
            </div>

            {/* Theme Icon */}
            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-[rgb(var(--accent-color))] rounded-xl shadow-lg">
              <Palette className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 lg:px-8 xl:px-12 py-6 lg:py-8 xl:py-12 safe-area-x content-safe-area" style={{ paddingTop: 'calc(var(--header-height) + 1.5rem)' }}>
        <div className="space-y-8">
          {/* Light/Dark Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
              {mode === 'light' ? <Sun className="w-6 h-6 mr-3 text-[rgb(var(--warning-color))]" /> : <Moon className="w-6 h-6 mr-3 text-[rgb(var(--info-color))]" />}
              Donker/Licht Modus
            </h2>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[rgb(var(--text-color))]/80 mb-2">
                  Huidige modus: <span className="font-semibold capitalize">{mode}</span>
                </p>
                <p className="text-xs text-[rgb(var(--text-color))]/60">
                  {mode === 'light' ? 'Licht thema voor overdag' : 'Donker thema voor \'s avonds'}
                </p>
              </div>
              
              <button
                onClick={handleModeToggle}
                className="relative inline-flex h-8 w-16 items-center rounded-full bg-[rgb(var(--border-color))]/30 transition-colors hover:bg-[rgb(var(--border-color))]/40"
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                  mode === 'light' ? 'translate-x-1' : 'translate-x-9'
                }`} />
              </button>
            </div>
          </motion.div>

          {/* Theme Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6">
              Kleurenschema's
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayThemes.map((themeOption) => (
                <motion.div
                  key={themeOption.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedTheme === themeOption.key
                      ? 'border-[rgb(var(--primary-color))] bg-[rgb(var(--primary-color))]/10'
                      : 'border-[rgb(var(--border-color))]/30 hover:border-[rgb(var(--border-color))]/50'
                  }`}
                  onClick={() => handleThemeChange(themeOption.key)}
                >
                  {selectedTheme === themeOption.key && (
                    <Check className="absolute top-2 right-2 w-5 h-5 text-[rgb(var(--primary-color))]" />
                  )}
                  
                  <h3 className="font-semibold text-[rgb(var(--card-text))] mb-1">
                    {themeOption.name}
                  </h3>
                  <p className="text-sm text-[rgb(var(--text-color))]/60 mb-3">
                    {themeOption.description}
                  </p>
                  
                  {renderColorPreview(themeOption, mode)}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Import/Export Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6">
              Importeren/Exporteren
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleExportTheme}
                className="flex items-center justify-center px-6 py-4 bg-[rgb(var(--success-color))] hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Download className="w-5 h-5 mr-3" />
                <span className="font-medium">Thema exporteren</span>
              </button>
              
              <label className="flex items-center justify-center px-6 py-4 bg-[rgb(var(--info-color))] hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer">
                <Upload className="w-5 h-5 mr-3" />
                <span className="font-medium">Thema importeren</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportTheme}
                  className="hidden"
                />
              </label>
            </div>
          </motion.div>

          {/* Reset Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[rgb(var(--error-color))]/10 border border-[rgb(var(--error-color))]/20 rounded-2xl p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--error-color))] mb-4">
              Thema resetten
            </h2>
            <p className="text-sm text-[rgb(var(--text-color))]/70 mb-4">
              Reset alle thema-instellingen naar de standaardwaarden.
            </p>
            <button
              onClick={handleResetTheme}
              className="px-6 py-3 bg-[rgb(var(--error-color))] hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Reset naar standaard
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ThemePage;