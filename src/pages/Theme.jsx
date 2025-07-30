import { motion } from 'framer-motion';
import { ArrowLeft, Palette, Moon, Sun, Sparkles } from 'lucide-react';
import { useUnifiedThemeContext } from '../context/UnifiedThemeContext';

const ThemePage = ({ onBack }) => {
  // New unified theme context
  const {
    mode: unifiedMode,
    toggleMode: unifiedToggleMode,
    isLoading: themeLoading,
    error: themeError
  } = useUnifiedThemeContext();

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
                aria-label="Terug naar overzicht"
              >
                <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6 group-hover:-translate-x-1 transition-transform duration-200" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-[rgb(var(--card-text))] tracking-tight">
                  Thema & Kleuren
                </h1>
                <p className="hidden lg:block text-sm text-[rgb(var(--text-color))]/60 font-medium">
                  Pas het uiterlijk van de app aan
                </p>
              </div>
            </div>

            {/* Theme Icon */}
            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
              <Palette className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 lg:px-8 xl:px-12 py-6 lg:py-8 xl:py-12 safe-area-x content-safe-area" style={{ paddingTop: 'calc(var(--header-height) + 1.5rem)' }}>
        <div className="space-y-8">
          {/* Theme Mode Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
              <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
              Thema Modus
            </h2>
            
            <div className="space-y-6">
              {/* Theme toggle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={unifiedToggleMode}
                  disabled={themeLoading}
                  className={`flex items-center justify-center space-x-3 p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    unifiedMode === 'light' 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
                      : 'bg-gradient-to-br from-blue-600 to-purple-700 text-white'
                  }`}
                >
                  {unifiedMode === 'light' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                  <div className="text-left">
                    <div className="font-semibold text-lg">
                      {unifiedMode === 'light' ? 'Licht Thema' : 'Donker Thema'}
                    </div>
                    <div className="text-sm opacity-90">
                      {unifiedMode === 'light' ? 'Helder en fris' : 'Zacht voor de ogen'}
                    </div>
                  </div>
                  {themeLoading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  )}
                </button>

                <div className="flex items-center justify-center p-6 rounded-xl bg-[rgb(var(--border-color))]/10 border-2 border-dashed border-[rgb(var(--border-color))]/30">
                  <div className="text-center">
                    <Sparkles className="w-8 h-8 text-[rgb(var(--text-color))]/40 mx-auto mb-2" />
                    <p className="text-sm text-[rgb(var(--text-color))]/60">
                      Klik links om te wisselen
                    </p>
                  </div>
                </div>
              </div>

              {/* Current theme info */}
              <div className="bg-[rgb(var(--border-color))]/10 p-6 rounded-xl">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-[rgb(var(--card-text))]">
                    Huidig thema: Gruvbox
                  </p>
                  <p className="text-sm text-[rgb(var(--text-color))]/60">
                    Modus: {unifiedMode === 'light' ? 'Licht' : 'Donker'}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-color))]/50">
                    Warme, retro kleuren voor optimaal comfort
                  </p>
                </div>
              </div>

              {/* Error display */}
              {themeError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Thema fout: {themeError.message || 'Onbekende fout'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Gruvbox Theme Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
              <Palette className="w-6 h-6 mr-3 text-primary" />
              Gruvbox Thema
            </h2>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-2xl mb-4">🎨</div>
                <p className="text-[rgb(var(--text-color))]/80 mb-4">
                  Het Gruvbox thema is ontworpen voor optimaal comfort met warme, retro kleuren die prettig zijn voor de ogen tijdens langdurig gebruik.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-xl bg-[rgb(var(--border-color))]/10">
                  <div className="w-8 h-8 bg-[#fe8019] rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-[rgb(var(--card-text))]">Oranje</p>
                  <p className="text-xs text-[rgb(var(--text-color))]/60">Primaire</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[rgb(var(--border-color))]/10">
                  <div className="w-8 h-8 bg-[#b8bb26] rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-[rgb(var(--card-text))]">Groen</p>
                  <p className="text-xs text-[rgb(var(--text-color))]/60">Secundaire</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[rgb(var(--border-color))]/10">
                  <div className="w-8 h-8 bg-[#fb4934] rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-[rgb(var(--card-text))]">Rood</p>
                  <p className="text-xs text-[rgb(var(--text-color))]/60">Accent</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[rgb(var(--border-color))]/10">
                  <div className="w-8 h-8 bg-[#83a598] rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium text-[rgb(var(--card-text))]">Blauw</p>
                  <p className="text-xs text-[rgb(var(--text-color))]/60">Info</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Theme Preview Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
              <Sparkles className="w-6 h-6 mr-3 text-accent" />
              Thema Voorbeeld
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-primary">Primaire Kleur</p>
              </div>
              <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-secondary rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-secondary">Secundaire Kleur</p>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center">
                <div className="w-8 h-8 bg-accent rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-accent">Accent Kleur</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

    </div>
  );
};

export default ThemePage;