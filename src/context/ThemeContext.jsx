import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#a855f7');
  const [accentColor, setAccentColor] = useState('#ec4899');

  useEffect(() => {
    const savedTheme = localStorage.getItem('boodschappenlijst_theme') || 'light';
    const savedPrimary = localStorage.getItem('boodschappenlijst_primary') || '#3b82f6';
    const savedSecondary = localStorage.getItem('boodschappenlijst_secondary') || '#a855f7';
    const savedAccent = localStorage.getItem('boodschappenlijst_accent') || '#ec4899';

    setTheme(savedTheme);
    setPrimaryColor(savedPrimary);
    setSecondaryColor(savedSecondary);
    setAccentColor(savedAccent);

    // Apply theme class for Tailwind
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Keep data-theme for CSS custom properties
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Apply theme colors (same colors for both light and dark mode)
    document.documentElement.style.setProperty('--color-primary', hexToRgb(savedPrimary));
    document.documentElement.style.setProperty('--color-secondary', hexToRgb(savedSecondary));
    document.documentElement.style.setProperty('--color-accent', hexToRgb(savedAccent));
  }, []);

  useEffect(() => {
    // Use the same colors for both light and dark mode
    document.documentElement.style.setProperty('--color-primary', hexToRgb(primaryColor));
    document.documentElement.style.setProperty('--color-secondary', hexToRgb(secondaryColor));
    document.documentElement.style.setProperty('--color-accent', hexToRgb(accentColor));
  }, [theme, primaryColor, secondaryColor, accentColor]);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '0 0 0';
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('boodschappenlijst_theme', newTheme);
    
    // Apply theme class for Tailwind
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Keep data-theme for CSS custom properties
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const updateColor = (type, color) => {
    const rgbColor = hexToRgb(color);
    switch (type) {
      case 'primary':
        setPrimaryColor(color);
        localStorage.setItem('boodschappenlijst_primary', color);
        document.documentElement.style.setProperty('--color-primary', rgbColor);
        break;
      case 'secondary':
        setSecondaryColor(color);
        localStorage.setItem('boodschappenlijst_secondary', color);
        document.documentElement.style.setProperty('--color-secondary', rgbColor);
        break;
      case 'accent':
        setAccentColor(color);
        localStorage.setItem('boodschappenlijst_accent', color);
        document.documentElement.style.setProperty('--color-accent', rgbColor);
        break;
    }
  };

  const resetColors = () => {
    const defaultPrimary = '#3b82f6';
    const defaultSecondary = '#a855f7';
    const defaultAccent = '#ec4899';

    setPrimaryColor(defaultPrimary);
    setSecondaryColor(defaultSecondary);
    setAccentColor(defaultAccent);

    localStorage.setItem('boodschappenlijst_primary', defaultPrimary);
    localStorage.setItem('boodschappenlijst_secondary', defaultSecondary);
    localStorage.setItem('boodschappenlijst_accent', defaultAccent);

    document.documentElement.style.setProperty('--color-primary', hexToRgb(defaultPrimary));
    document.documentElement.style.setProperty('--color-secondary', hexToRgb(defaultSecondary));
    document.documentElement.style.setProperty('--color-accent', hexToRgb(defaultAccent));
  };

  const value = {
    theme,
    primaryColor,
    secondaryColor,
    accentColor,
    toggleTheme,
    updateColor,
    resetColors,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};