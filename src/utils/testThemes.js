// Test script to verify theme palettes are working correctly
import { themePalettes } from './themePalettes.js';
import { unifiedColorManager } from './colorManager.js';

export const testThemeLoading = () => {
  console.log('=== THEME DEBUGGING TEST ===');
  
  // Test 1: Check if themePalettes is loaded
  console.log('1. themePalettes loaded:', !!themePalettes);
  console.log('   themePalettes type:', typeof themePalettes);
  console.log('   themePalettes length:', themePalettes?.length || 0);
  
  if (themePalettes && themePalettes.length > 0) {
    console.log('   First theme:', themePalettes[0]?.name);
    console.log('   Available themes:', themePalettes.map(t => t.name).join(', '));
  }

  // Test 2: Check unifiedColorManager
  console.log('\n2. unifiedColorManager loaded:', !!unifiedColorManager);
  console.log('   Available palettes from manager:', unifiedColorManager.getAvailablePalettes()?.length || 0);
  
  const available = unifiedColorManager.getAvailablePalettes();
  if (available && available.length > 0) {
    console.log('   Available theme names:', available.map(t => t.name).join(', '));
  } else {
    console.log('   WARNING: No themes available from manager!');
  }

  // Test 3: Check current theme
  console.log('\n3. Current theme:', unifiedColorManager.getCurrentTheme()?.name || 'None');
  console.log('   Current palette:', unifiedColorManager.getCurrentTheme()?.palette?.name || 'None');
  
  // Test 4: Check for errors in themePalettes.js
  try {
    const testTheme = themePalettes.find(t => t.key === 'gruvbox');
    console.log('\n4. Gruvbox theme test:', !!testTheme);
    if (testTheme) {
      console.log('   Gruvbox colors:', Object.keys(testTheme.colors));
    }
  } catch (error) {
    console.error('   Error accessing Gruvbox theme:', error);
  }
  
  console.log('\n=== TEST COMPLETE ===');
  
  return {
    themePalettesLoaded: !!themePalettes,
    themeCount: themePalettes?.length || 0,
    availableFromManager: unifiedColorManager.getAvailablePalettes()?.length || 0,
    currentThemeName: unifiedColorManager.getCurrentTheme()?.name || 'None'
  };
};

// Auto-run test in browser
if (typeof window !== 'undefined') {
  window.testThemeLoading = testThemeLoading;
  console.log('Theme test function available: window.testThemeLoading()');
}