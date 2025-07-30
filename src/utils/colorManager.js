// Unified theme color management system with light/dark mode synchronization
import { persistentStorage } from './persistentStorage';
import { themePalettes } from './themePalettes';

const COLOR_THEME_KEY = 'unified_color_theme';
const DEFAULT_THEME_KEY = 'default_theme_preference';

// Color utility functions
export const colorUtils = {
  // Convert hex to RGB
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // Convert RGB to hex
  rgbToHex: (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  // Calculate luminance for accessibility
  getLuminance: (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio
  getContrastRatio: (color1, color2) => {
    const lum1 = colorUtils.getLuminance(color1.r, color1.g, color1.b);
    const lum2 = colorUtils.getLuminance(color2.r, color2.g, color2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if color meets WCAG AA standards
  meetsAccessibilityStandards: (foreground, background) => {
    const contrast = colorUtils.getContrastRatio(foreground, background);
    return {
      aa: contrast >= 4.5,
      aaa: contrast >= 7,
      contrast: contrast.toFixed(2)
    };
  },

  // Generate color variations
  generateColorVariations: (baseColor, mode = 'light') => {
    const rgb = colorUtils.hexToRgb(baseColor);
    if (!rgb) return null;

    const variations = {};
    
    if (mode === 'light') {
      // Light mode variations - darker shades
      variations.primary = baseColor;
      variations.primaryHover = colorUtils.adjustBrightness(baseColor, -10);
      variations.primaryActive = colorUtils.adjustBrightness(baseColor, -20);
      variations.primaryLight = colorUtils.adjustBrightness(baseColor, 20);
      variations.primaryDark = colorUtils.adjustBrightness(baseColor, -30);
    } else {
      // Dark mode variations - lighter shades
      variations.primary = baseColor;
      variations.primaryHover = colorUtils.adjustBrightness(baseColor, 10);
      variations.primaryActive = colorUtils.adjustBrightness(baseColor, 20);
      variations.primaryLight = colorUtils.adjustBrightness(baseColor, 30);
      variations.primaryDark = colorUtils.adjustBrightness(baseColor, -20);
    }

    return variations;
  },

  // Adjust brightness of a color
  adjustBrightness: (hex, percent) => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return hex;

    const adjust = (color) => {
      const adjusted = Math.round(color + (color * percent / 100));
      return Math.max(0, Math.min(255, adjusted));
    };

    return colorUtils.rgbToHex(
      adjust(rgb.r),
      adjust(rgb.g),
      adjust(rgb.b)
    );
  },

  // Generate complementary color
  getComplementaryColor: (hex) => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return hex;

    return colorUtils.rgbToHex(
      255 - rgb.r,
      255 - rgb.g,
      255 - rgb.b
    );
  },

  // Generate analogous colors
  getAnalogousColors: (hex) => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return [hex, hex];

    // Convert to HSL for easier manipulation
    const hsl = colorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    const analogous1 = colorUtils.hslToRgb(
      (hsl.h + 30) % 360,
      hsl.s,
      hsl.l
    );
    
    const analogous2 = colorUtils.hslToRgb(
      (hsl.h - 30 + 360) % 360,
      hsl.s,
      hsl.l
    );

    return [
      colorUtils.rgbToHex(analogous1.r, analogous1.g, analogous1.b),
      colorUtils.rgbToHex(analogous2.r, analogous2.g, analogous2.b)
    ];
  },

  // RGB to HSL conversion
  rgbToHsl: (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  },

  // HSL to RGB conversion
  hslToRgb: (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
};


// Unified Color Theme Manager
class UnifiedColorManager {
  constructor() {
    this.currentTheme = null;
    this.subscribers = new Set();
    this.initialize();
  }

  async initialize() {
    try {
      // Load saved theme
      const savedTheme = await persistentStorage.getItem(COLOR_THEME_KEY);
      const defaultMode = await persistentStorage.getItem(DEFAULT_THEME_KEY) || 'light';
      
      if (savedTheme) {
        this.currentTheme = savedTheme;
      } else {
        // Set default Gruvbox theme but allow switching
        this.currentTheme = {
          name: 'Gruvbox',
          palette: themePalettes[0],
          mode: defaultMode,
          customColors: {},
          accessibility: {
            enforceStandards: true,
            minimumContrast: 4.5
          },
          createdAt: Date.now(),
          lastModified: Date.now()
        };
        await this.saveTheme();
      }

      this.applyTheme();
      console.log('Unified color manager initialized with theme:', this.currentTheme.name);
    } catch (error) {
      console.error('Failed to initialize color manager:', error);
      this.setDefaultTheme();
    }
  }

  setDefaultTheme() {
    this.currentTheme = {
      name: 'Gruvbox',
      palette: themePalettes[0], // Gruvbox is the first theme
      mode: 'light',
      customColors: {},
      accessibility: {
        enforceStandards: true,
        minimumContrast: 4.5
      },
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    this.applyTheme();
  }

  // Subscribe to theme changes
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify subscribers of theme changes
  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.currentTheme);
      } catch (error) {
        console.error('Theme subscriber error:', error);
      }
    });
  }

  // Get current theme
  getCurrentTheme() {
    return { ...this.currentTheme };
  }

  // Set color palette (maintains colors across light/dark mode)
  async setColorPalette(paletteKey) {
    const selectedTheme = themePalettes.find(theme => theme.key === paletteKey);
    if (!selectedTheme) {
      console.warn(`Theme palette '${paletteKey}' not found`);
      return;
    }

    this.currentTheme = {
      ...this.currentTheme,
      name: selectedTheme.name,
      palette: selectedTheme,
      lastModified: Date.now()
    };

    await this.saveTheme();
    this.applyTheme();
    this.notifySubscribers();
  }

  // Toggle between light and dark mode (preserves colors)
  async toggleMode() {
    const newMode = this.currentTheme.mode === 'light' ? 'dark' : 'light';
    await this.setMode(newMode);
  }

  // Set specific mode (preserves colors)
  async setMode(mode) {
    if (mode !== 'light' && mode !== 'dark') {
      throw new Error('Mode must be "light" or "dark"');
    }

    this.currentTheme = {
      ...this.currentTheme,
      mode,
      lastModified: Date.now()
    };

    await this.saveTheme();
    await persistentStorage.setItem(DEFAULT_THEME_KEY, mode, { critical: true });
    this.applyTheme();
    this.notifySubscribers();
  }

  // Set custom color - allows color customization within current theme
  async setCustomColor(colorKey, hexColor) {
    const validation = this.validateColorAccessibility(hexColor);
    if (!validation.valid) {
      console.warn(`Color validation failed: ${validation.reason}`);
      return;
    }

    this.currentTheme = {
      ...this.currentTheme,
      customColors: {
        ...this.currentTheme.customColors,
        [colorKey]: hexColor
      },
      lastModified: Date.now()
    };

    await this.saveTheme();
    this.applyTheme();
    this.notifySubscribers();
  }

  // Validate color accessibility
  validateColorAccessibility(hexColor) {
    const rgb = colorUtils.hexToRgb(hexColor);
    if (!rgb) return { valid: false, reason: 'Invalid color format' };

    // Get background color based on current mode
    const bgColor = this.currentTheme.mode === 'light' 
      ? { r: 251, g: 241, b: 199 } // Light background
      : { r: 40, g: 40, b: 40 };   // Dark background

    const accessibility = colorUtils.meetsAccessibilityStandards(rgb, bgColor);
    
    if (accessibility.contrast < this.currentTheme.accessibility.minimumContrast) {
      return {
        valid: false,
        reason: `Contrast ratio ${accessibility.contrast} is below minimum ${this.currentTheme.accessibility.minimumContrast}`,
        contrast: accessibility.contrast
      };
    }

    return { valid: true, contrast: accessibility.contrast };
  }

  // Get effective color (custom override or palette default)
  getEffectiveColor(colorKey) {
    return this.currentTheme.customColors[colorKey] || 
           this.currentTheme.palette.colors[colorKey] || 
           '#6b7280'; // Fallback gray
  }

  // Apply theme to CSS variables
  applyTheme() {
    const root = document.documentElement;
    const mode = this.currentTheme.mode;
    
    // Set theme mode attribute
    root.setAttribute('data-theme', mode);
    
    // Apply colors with mode-appropriate variations
    Object.keys(this.currentTheme.palette.colors).forEach(colorKey => {
      const baseColor = this.getEffectiveColor(colorKey);
      const variations = colorUtils.generateColorVariations(baseColor, mode);
      
      if (variations) {
        // Convert hex to RGB for CSS variables
        Object.entries(variations).forEach(([variant, hex]) => {
          const rgb = colorUtils.hexToRgb(hex);
          if (rgb) {
            root.style.setProperty(`--color-${colorKey}-${variant}`, `${rgb.r} ${rgb.g} ${rgb.b}`);
          }
        });
      }
      
      // Set base color
      const rgb = colorUtils.hexToRgb(baseColor);
      if (rgb) {
        root.style.setProperty(`--color-${colorKey}`, `${rgb.r} ${rgb.g} ${rgb.b}`);
      }
    });

    // Set background and text colors based on mode
    if (mode === 'light') {
      root.style.setProperty('--bg-color', '251 241 199');     // Gruvbox light bg
      root.style.setProperty('--text-color', '60 56 54');      // Gruvbox dark text
      root.style.setProperty('--card-bg', '242 229 188');      // Gruvbox light1
      root.style.setProperty('--card-text', '60 56 54');       // Gruvbox dark text
      root.style.setProperty('--border-color', '213 196 161'); // Gruvbox light2
    } else {
      root.style.setProperty('--bg-color', '40 40 40');        // Gruvbox dark bg
      root.style.setProperty('--text-color', '235 219 178');   // Gruvbox light text
      root.style.setProperty('--card-bg', '60 56 54');         // Gruvbox dark1
      root.style.setProperty('--card-text', '235 219 178');    // Gruvbox light text
      root.style.setProperty('--border-color', '80 73 69');    // Gruvbox dark gray
    }

    console.log(`Applied ${this.currentTheme.name} theme in ${mode} mode`);
  }

  // Save theme to persistent storage
  async saveTheme() {
    try {
      await persistentStorage.setItem(COLOR_THEME_KEY, this.currentTheme, { critical: true });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  // Export theme configuration
  exportTheme() {
    return {
      ...this.currentTheme,
      exportedAt: Date.now(),
      version: '1.0'
    };
  }

  // Import theme configuration
  async importTheme(themeData) {
    try {
      // Validate theme data
      if (!themeData.palette || !themeData.name) {
        throw new Error('Invalid theme data');
      }

      this.currentTheme = {
        ...themeData,
        lastModified: Date.now(),
        importedAt: Date.now()
      };

      await this.saveTheme();
      this.applyTheme();
      this.notifySubscribers();
      
      return true;
    } catch (error) {
      console.error('Failed to import theme:', error);
      return false;
    }
  }

  // Reset to default theme
  async resetTheme() {
    this.setDefaultTheme();
    await this.saveTheme();
    this.notifySubscribers();
  }

  // Get available palettes
  getAvailablePalettes() {
    if (!themePalettes || !Array.isArray(themePalettes)) {
      console.error('themePalettes is not loaded correctly:', themePalettes);
      return [];
    }
    
    return themePalettes.map(theme => ({
      key: theme.key,
      name: theme.name,
      description: theme.description,
      colors: theme.colors,
      lightMode: theme.lightMode
    }));
  }

  // Get theme statistics
  getThemeStats() {
    return {
      name: this.currentTheme.name,
      mode: this.currentTheme.mode,
      customColors: Object.keys(this.currentTheme.customColors).length,
      createdAt: this.currentTheme.createdAt,
      lastModified: this.currentTheme.lastModified,
      accessibility: this.currentTheme.accessibility
    };
  }
}

// Create singleton instance
export const unifiedColorManager = new UnifiedColorManager();

// Export convenience functions
export const useUnifiedColors = () => ({
  getCurrentTheme: () => unifiedColorManager.getCurrentTheme(),
  setColorPalette: (palette) => unifiedColorManager.setColorPalette(palette),
  toggleMode: () => unifiedColorManager.toggleMode(),
  setMode: (mode) => unifiedColorManager.setMode(mode),
  setCustomColor: (key, color) => unifiedColorManager.setCustomColor(key, color),
  getEffectiveColor: (key) => unifiedColorManager.getEffectiveColor(key),
  subscribe: (callback) => unifiedColorManager.subscribe(callback),
  exportTheme: () => unifiedColorManager.exportTheme(),
  importTheme: (data) => unifiedColorManager.importTheme(data),
  resetTheme: () => unifiedColorManager.resetTheme(),
  getAvailablePalettes: () => unifiedColorManager.getAvailablePalettes(),
  getThemeStats: () => unifiedColorManager.getThemeStats()
});