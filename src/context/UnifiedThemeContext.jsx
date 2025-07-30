// Enhanced theme context that integrates unified color management
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { unifiedColorManager } from '../utils/colorManager';
import { persistentStorage } from '../utils/persistentStorage';

const UnifiedThemeContext = createContext();

export const useUnifiedThemeContext = () => {
  const context = useContext(UnifiedThemeContext);
  if (!context) {
    throw new Error('useUnifiedThemeContext must be used within a UnifiedThemeProvider');
  }
  return context;
};

export const UnifiedThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribers, setSubscribers] = useState(new Set());

  // Initialize unified theme system
  useEffect(() => {
    let isCancelled = false;

    const initializeTheme = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize the unified color manager
        await unifiedColorManager.initialize();
        
        if (!isCancelled) {
          const currentTheme = unifiedColorManager.getCurrentTheme();
          setTheme(currentTheme);
          
          // Apply theme to DOM
          applyThemeToDOM(currentTheme);
        }
      } catch (err) {
        console.error('Failed to initialize unified theme:', err);
        if (!isCancelled) {
          setError(err);
          // Fallback to default theme
          const fallbackTheme = createFallbackTheme();
          setTheme(fallbackTheme);
          applyThemeToDOM(fallbackTheme);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    initializeTheme();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Subscribe to theme changes from unified color manager
  useEffect(() => {
    const unsubscribe = unifiedColorManager.subscribe((newTheme) => {
      setTheme(newTheme);
      applyThemeToDOM(newTheme);
      
      // Notify local subscribers
      subscribers.forEach(callback => {
        try {
          callback(newTheme);
        } catch (error) {
          console.error('Theme subscriber error:', error);
        }
      });
    });

    return unsubscribe;
  }, [subscribers]);

  // Apply theme to DOM elements - delegate to unified color manager
  const applyThemeToDOM = useCallback((themeData) => {
    if (!themeData) return;

    try {
      // Apply Tailwind dark class
      if (themeData.mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Let the unified color manager handle the actual theme application
      // This ensures consistency and avoids conflicts
      unifiedColorManager.applyTheme();
      
    } catch (error) {
      console.error('Failed to apply theme to DOM:', error);
    }
  }, []);

  // Create fallback theme for error cases
  const createFallbackTheme = useCallback(() => {
    return {
      mode: 'light',
      palette: {
        name: 'Default',
        key: 'default',
        colors: {
          primary: '#3b82f6',
          secondary: '#a855f7',
          accent: '#ec4899',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1f2937',
          textSecondary: '#6b7280'
        }
      },
      customColors: {},
      accessibility: {
        enforceStandards: true,
        minimumContrast: 4.5
      },
      createdAt: Date.now(),
      lastModified: Date.now()
    };
  }, []);

  // Utility function to convert hex to RGB
  const hexToRgb = useCallback((hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '0 0 0';
  }, []);

  // Theme manipulation methods
  const toggleMode = useCallback(async () => {
    try {
      setError(null);
      await unifiedColorManager.toggleMode();
    } catch (err) {
      console.error('Failed to toggle theme mode:', err);
      setError(err);
      throw err;
    }
  }, []);

  const setMode = useCallback(async (mode) => {
    try {
      setError(null);
      await unifiedColorManager.setMode(mode);
    } catch (err) {
      console.error('Failed to set theme mode:', err);
      setError(err);
      throw err;
    }
  }, []);

  // Set color palette from available themes
  const setColorPalette = useCallback(async (paletteKey) => {
    try {
      setError(null);
      await unifiedColorManager.setColorPalette(paletteKey);
    } catch (err) {
      console.error('Failed to set color palette:', err);
      setError(err);
      throw err;
    }
  }, []);

  // Set custom color
  const setCustomColor = useCallback(async (colorKey, color) => {
    try {
      setError(null);
      await unifiedColorManager.setCustomColor(colorKey, color);
    } catch (err) {
      console.error('Failed to set custom color:', err);
      setError(err);
      throw err;
    }
  }, []);

  const resetTheme = useCallback(async () => {
    try {
      setError(null);
      await unifiedColorManager.resetTheme();
    } catch (err) {
      console.error('Failed to reset theme:', err);
      setError(err);
      throw err;
    }
  }, []);

  const getEffectiveColor = useCallback((colorKey) => {
    return unifiedColorManager.getEffectiveColor(colorKey);
  }, []);

  // Legacy compatibility methods
  const updateColor = useCallback(async (type, color) => {
    try {
      // Allow legacy color updates through modern system
      await setCustomColor(type, color);
    } catch (error) {
      console.error('Legacy updateColor failed:', error);
    }
  }, [setCustomColor]);

  const resetColors = useCallback(async () => {
    try {
      await resetTheme();
    } catch (error) {
      console.error('Legacy resetColors failed:', error);
    }
  }, [resetTheme]);

  // Subscribe to theme changes
  const subscribe = useCallback((callback) => {
    setSubscribers(prev => new Set([...prev, callback]));
    
    return () => {
      setSubscribers(prev => {
        const newSet = new Set(prev);
        newSet.delete(callback);
        return newSet;
      });
    };
  }, []);

  // Export theme data
  const exportTheme = useCallback(() => {
    return unifiedColorManager.exportTheme();
  }, []);

  // Import theme data
  const importTheme = useCallback(async (themeData) => {
    try {
      setError(null);
      const success = await unifiedColorManager.importTheme(themeData);
      if (!success) {
        throw new Error('Failed to import theme');
      }
      return true;
    } catch (err) {
      console.error('Failed to import theme:', err);
      setError(err);
      throw err;
    }
  }, []);

  // Get theme statistics
  const getThemeStats = useCallback(() => {
    return unifiedColorManager.getThemeStats();
  }, []);

  // Get available palettes from all themes
  const getAvailablePalettes = useCallback(() => {
    return unifiedColorManager.getAvailablePalettes() || [];
  }, []);

  // Validate color accessibility
  const validateColorAccessibility = useCallback((hexColor) => {
    return unifiedColorManager.validateColorAccessibility(hexColor);
  }, []);

  const value = {
    // Current theme state
    theme,
    isLoading,
    error,
    
    // Theme properties (for backward compatibility)
    mode: theme?.mode || 'light',
    primaryColor: theme?.customColors?.primary || theme?.palette?.colors?.primary || '#3b82f6',
    secondaryColor: theme?.customColors?.secondary || theme?.palette?.colors?.secondary || '#a855f7',
    accentColor: theme?.customColors?.accent || theme?.palette?.colors?.accent || '#ec4899',
    
    // Theme manipulation
    toggleMode,
    setMode,
    setColorPalette,
    setCustomColor,
    resetTheme,
    getEffectiveColor,
    
    // Legacy compatibility
    toggleTheme: toggleMode, // Alias for backward compatibility
    updateColor,
    resetColors,
    
    // Advanced features
    subscribe,
    exportTheme,
    importTheme,
    getThemeStats,
    getAvailablePalettes,
    validateColorAccessibility,
    
    // Utility methods
    hexToRgb,
    
    // Palette information
    currentPalette: theme?.palette?.name || 'Unknown',
    availablePalettes: getAvailablePalettes(),
    customColors: theme?.customColors || {},
    
    // Accessibility settings
    accessibilityEnabled: theme?.accessibility?.enforceStandards || false,
    minimumContrast: theme?.accessibility?.minimumContrast || 4.5
  };

  return (
    <UnifiedThemeContext.Provider value={value}>
      {children}
    </UnifiedThemeContext.Provider>
  );
};

// Higher-order component for theme integration
export const withUnifiedTheme = (Component) => {
  return function ThemedComponent(props) {
    const themeProps = useUnifiedThemeContext();
    return <Component {...props} {...themeProps} />;
  };
};

// Hook for accessing specific theme colors
export const useThemeColors = () => {
  const { theme, getEffectiveColor } = useUnifiedThemeContext();
  
  const getColor = useCallback((colorKey, fallback = '#6b7280') => {
    try {
      return getEffectiveColor(colorKey) || fallback;
    } catch (error) {
      console.warn(`Failed to get color for key "${colorKey}":`, error);
      return fallback;
    }
  }, [getEffectiveColor]);
  
  const colors = {
    primary: getColor('primary'),
    secondary: getColor('secondary'),
    accent: getColor('accent'),
    background: getColor('background'),
    surface: getColor('surface'),
    text: getColor('text'),
    textSecondary: getColor('textSecondary'),
    success: getColor('success'),
    warning: getColor('warning'),
    error: getColor('error'),
    info: getColor('info')
  };
  
  return {
    colors,
    getColor,
    mode: theme?.mode || 'light',
    isDark: theme?.mode === 'dark'
  };
};

// Hook for theme persistence status
export const useThemePersistence = () => {
  const [persistenceStatus, setPersistenceStatus] = useState({
    isHealthy: true,
    lastSync: null,
    errors: []
  });
  
  useEffect(() => {
    const checkPersistence = async () => {
      try {
        const isHealthy = await persistentStorage.isHealthy();
        const lastSync = await persistentStorage.getItem('unified_theme_last_sync');
        
        setPersistenceStatus({
          isHealthy,
          lastSync: lastSync ? new Date(lastSync) : null,
          errors: []
        });
      } catch (error) {
        setPersistenceStatus(prev => ({
          ...prev,
          isHealthy: false,
          errors: [...prev.errors, error.message]
        }));
      }
    };
    
    checkPersistence();
    const interval = setInterval(checkPersistence, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return persistenceStatus;
};