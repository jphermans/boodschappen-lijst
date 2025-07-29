// React hook for unified theme color management
import { useState, useEffect, useCallback } from 'react';
import { unifiedColorManager, colorUtils } from '../utils/colorManager';

// Main hook for unified theme management
export function useUnifiedTheme() {
  const [theme, setTheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial theme
  useEffect(() => {
    let isCancelled = false;

    const loadTheme = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Wait for color manager to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const currentTheme = unifiedColorManager.getCurrentTheme();
        
        if (!isCancelled) {
          setTheme(currentTheme);
        }
      } catch (err) {
        console.error('Failed to load unified theme:', err);
        if (!isCancelled) {
          setError(err);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadTheme();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Subscribe to theme changes
  useEffect(() => {
    const unsubscribe = unifiedColorManager.subscribe((newTheme) => {
      setTheme(newTheme);
    });

    return unsubscribe;
  }, []);

  // Set color palette
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

  // Toggle between light and dark mode
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

  // Set specific mode
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

  // Set custom color
  const setCustomColor = useCallback(async (colorKey, hexColor) => {
    try {
      setError(null);
      await unifiedColorManager.setCustomColor(colorKey, hexColor);
    } catch (err) {
      console.error('Failed to set custom color:', err);
      setError(err);
      throw err;
    }
  }, []);

  // Get effective color
  const getEffectiveColor = useCallback((colorKey) => {
    return unifiedColorManager.getEffectiveColor(colorKey);
  }, [theme]);

  // Reset theme
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

  return {
    theme,
    isLoading,
    error,
    setColorPalette,
    toggleMode,
    setMode,
    setCustomColor,
    getEffectiveColor,
    resetTheme,
    // Convenience getters
    currentMode: theme?.mode || 'light',
    currentPalette: theme?.palette?.name || 'Unknown',
    customColors: theme?.customColors || {},
    availablePalettes: unifiedColorManager.getAvailablePalettes()
  };
}

// Hook for color accessibility validation
export function useColorAccessibility() {
  const { theme } = useUnifiedTheme();

  const validateColor = useCallback((colorKey, hexColor) => {
    return unifiedColorManager.validateColorAccessibility(colorKey, hexColor);
  }, [theme]);

  const getContrastRatio = useCallback((foregroundHex, backgroundHex) => {
    const fg = colorUtils.hexToRgb(foregroundHex);
    const bg = colorUtils.hexToRgb(backgroundHex);
    
    if (!fg || !bg) return 0;
    
    return colorUtils.getContrastRatio(fg, bg);
  }, []);

  const meetsStandards = useCallback((foregroundHex, backgroundHex) => {
    const fg = colorUtils.hexToRgb(foregroundHex);
    const bg = colorUtils.hexToRgb(backgroundHex);
    
    if (!fg || !bg) return { aa: false, aaa: false, contrast: 0 };
    
    return colorUtils.meetsAccessibilityStandards(fg, bg);
  }, []);

  return {
    validateColor,
    getContrastRatio,
    meetsStandards,
    minimumContrast: theme?.accessibility?.minimumContrast || 4.5,
    enforceStandards: theme?.accessibility?.enforceStandards || true
  };
}

// Hook for color palette management
export function useColorPalettes() {
  const { theme, setColorPalette } = useUnifiedTheme();
  const [isChanging, setIsChanging] = useState(false);

  const availablePalettes = unifiedColorManager.getAvailablePalettes();
  const currentPalette = theme?.palette;

  const changePalette = useCallback(async (paletteKey) => {
    try {
      setIsChanging(true);
      await setColorPalette(paletteKey);
    } catch (error) {
      console.error('Failed to change palette:', error);
      throw error;
    } finally {
      setIsChanging(false);
    }
  }, [setColorPalette]);

  const getPalettePreview = useCallback((paletteKey) => {
    const palette = availablePalettes.find(p => p.key === paletteKey);
    return palette ? palette.colors : null;
  }, [availablePalettes]);

  return {
    availablePalettes,
    currentPalette,
    changePalette,
    getPalettePreview,
    isChanging
  };
}

// Hook for custom color management
export function useCustomColors() {
  const { theme, setCustomColor } = useUnifiedTheme();
  const { validateColor } = useColorAccessibility();
  const [isUpdating, setIsUpdating] = useState(false);

  const customColors = theme?.customColors || {};

  const updateCustomColor = useCallback(async (colorKey, hexColor) => {
    try {
      setIsUpdating(true);
      
      // Validate color first
      const validation = validateColor(colorKey, hexColor);
      if (!validation.valid) {
        throw new Error(validation.reason);
      }

      await setCustomColor(colorKey, hexColor);
    } catch (error) {
      console.error('Failed to update custom color:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [setCustomColor, validateColor]);

  const removeCustomColor = useCallback(async (colorKey) => {
    try {
      setIsUpdating(true);
      
      // Remove by setting to undefined (will fall back to palette color)
      const updatedCustomColors = { ...customColors };
      delete updatedCustomColors[colorKey];
      
      // Update the theme
      const currentTheme = unifiedColorManager.getCurrentTheme();
      currentTheme.customColors = updatedCustomColors;
      currentTheme.lastModified = Date.now();
      
      await unifiedColorManager.saveTheme();
      unifiedColorManager.applyTheme();
      unifiedColorManager.notifySubscribers();
    } catch (error) {
      console.error('Failed to remove custom color:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [customColors]);

  const hasCustomColor = useCallback((colorKey) => {
    return colorKey in customColors;
  }, [customColors]);

  const getColorSource = useCallback((colorKey) => {
    if (hasCustomColor(colorKey)) {
      return {
        source: 'custom',
        color: customColors[colorKey]
      };
    }
    
    return {
      source: 'palette',
      color: theme?.palette?.colors?.[colorKey] || '#6b7280'
    };
  }, [customColors, theme, hasCustomColor]);

  return {
    customColors,
    updateCustomColor,
    removeCustomColor,
    hasCustomColor,
    getColorSource,
    isUpdating
  };
}

// Hook for theme import/export
export function useThemeImportExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState(null);

  const exportTheme = useCallback(async () => {
    try {
      setIsExporting(true);
      setError(null);

      const themeData = unifiedColorManager.exportTheme();
      
      // Create downloadable file
      const dataStr = JSON.stringify(themeData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `theme-${themeData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      return themeData;
    } catch (err) {
      console.error('Failed to export theme:', err);
      setError(err);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const importTheme = useCallback(async (file) => {
    try {
      setIsImporting(true);
      setError(null);

      const text = await file.text();
      const themeData = JSON.parse(text);
      
      const success = await unifiedColorManager.importTheme(themeData);
      
      if (!success) {
        throw new Error('Failed to import theme');
      }
      
      return themeData;
    } catch (err) {
      console.error('Failed to import theme:', err);
      setError(err);
      throw err;
    } finally {
      setIsImporting(false);
    }
  }, []);

  const importThemeFromData = useCallback(async (themeData) => {
    try {
      setIsImporting(true);
      setError(null);

      const success = await unifiedColorManager.importTheme(themeData);
      
      if (!success) {
        throw new Error('Failed to import theme data');
      }
      
      return themeData;
    } catch (err) {
      console.error('Failed to import theme data:', err);
      setError(err);
      throw err;
    } finally {
      setIsImporting(false);
    }
  }, []);

  return {
    exportTheme,
    importTheme,
    importThemeFromData,
    isExporting,
    isImporting,
    error
  };
}

// Hook for theme statistics and information
export function useThemeStats() {
  const { theme } = useUnifiedTheme();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (theme) {
      const themeStats = unifiedColorManager.getThemeStats();
      setStats(themeStats);
    }
  }, [theme]);

  const getColorUsage = useCallback(() => {
    if (!theme) return {};

    const usage = {};
    const paletteColors = Object.keys(theme.palette?.colors || {});
    const customColors = Object.keys(theme.customColors || {});

    paletteColors.forEach(key => {
      usage[key] = {
        source: customColors.includes(key) ? 'custom' : 'palette',
        color: unifiedColorManager.getEffectiveColor(key)
      };
    });

    return usage;
  }, [theme]);

  const getThemeAge = useCallback(() => {
    if (!theme?.createdAt) return null;

    const now = Date.now();
    const created = theme.createdAt;
    const ageMs = now - created;
    
    const days = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ageMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} dag${days !== 1 ? 'en' : ''} geleden`;
    } else if (hours > 0) {
      return `${hours} uur geleden`;
    } else {
      return 'Minder dan een uur geleden';
    }
  }, [theme]);

  const getLastModified = useCallback(() => {
    if (!theme?.lastModified) return null;

    const now = Date.now();
    const modified = theme.lastModified;
    const ageMs = now - modified;
    
    const minutes = Math.floor(ageMs / (1000 * 60));
    const hours = Math.floor(ageMs / (1000 * 60 * 60));
    const days = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days} dag${days !== 1 ? 'en' : ''} geleden`;
    } else if (hours > 0) {
      return `${hours} uur geleden`;
    } else if (minutes > 0) {
      return `${minutes} minuten geleden`;
    } else {
      return 'Zojuist';
    }
  }, [theme]);

  return {
    stats,
    getColorUsage,
    getThemeAge,
    getLastModified,
    totalColors: Object.keys(theme?.palette?.colors || {}).length,
    customColorCount: Object.keys(theme?.customColors || {}).length,
    currentMode: theme?.mode || 'light',
    accessibilityEnabled: theme?.accessibility?.enforceStandards || false
  };
}