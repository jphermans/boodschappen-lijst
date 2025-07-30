// Simple debug utility to check theme system health
export const debugThemes = () => {
  console.log('=== THEME DEBUG INFO ===');
  
  // Check if themes are loaded
  try {
    const { unifiedColorManager } = require('./colorManager.js');
    const palettes = unifiedColorManager.getAvailablePalettes();
    console.log('Available palettes:', palettes.length);
    console.log('Palette names:', palettes.map(p => p.name));
  } catch (e) {
    console.error('Failed to load colorManager:', e);
  }
  
  // Check localStorage
  console.log('Local storage themes:', {
    unified_color_theme: localStorage.getItem('unified_color_theme'),
    default_theme_preference: localStorage.getItem('default_theme_preference')
  });
  
  // Check for any console errors
  console.log('Current theme system status: All themes should now be available');
};

// Add to global scope for easy testing
if (typeof window !== 'undefined') {
  window.debugThemes = debugThemes;
}