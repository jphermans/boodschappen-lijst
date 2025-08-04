/**
 * State Persistence Middleware
 * Handles saving and restoring application state to/from localStorage
 */

import errorHandler from './errorHandler';

// Storage keys
const STORAGE_KEYS = {
  APP_STATE: 'boodschappenlijst_app_state',
  LIST_STATE: 'boodschappenlijst_list_state',
  STATE_VERSION: 'boodschappenlijst_state_version'
};

// Current state version for migration handling
const CURRENT_STATE_VERSION = '1.0.0';

/**
 * State persistence configuration
 */
const PERSISTENCE_CONFIG = {
  // Which parts of state to persist
  appState: {
    persist: ['currentPage', 'newListName', 'navigationHistory'],
    exclude: ['isLoading', 'error', 'optimisticOperations']
  },
  listState: {
    persist: ['lists', 'stats'],
    exclude: ['isLoading', 'listsLoading', 'error', 'listErrors', 'optimisticOperations']
  },
  
  // Persistence settings
  debounceMs: 500, // Debounce saves to avoid excessive writes
  maxHistorySize: 10, // Maximum navigation history to persist
  maxRetries: 3 // Maximum retry attempts for persistence operations
};

/**
 * Debounce utility for persistence operations
 */
class Debouncer {
  constructor(delay) {
    this.delay = delay;
    this.timeouts = new Map();
  }
  
  debounce(key, fn) {
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }
    
    const timeout = setTimeout(() => {
      fn();
      this.timeouts.delete(key);
    }, this.delay);
    
    this.timeouts.set(key, timeout);
  }
  
  clear() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }
}

/**
 * State persistence manager
 */
class StatePersistenceManager {
  constructor() {
    this.debouncer = new Debouncer(PERSISTENCE_CONFIG.debounceMs);
    this.isInitialized = false;
    this.migrationHandlers = new Map();
    
    // Setup migration handlers
    this.setupMigrationHandlers();
  }
  
  /**
   * Initialize persistence manager
   */
  initialize() {
    if (this.isInitialized) return;
    
    try {
      // Check if we need to migrate state
      this.handleStateMigration();
      this.isInitialized = true;
      
      console.log('📦 State persistence manager initialized');
    } catch (error) {
      console.error('Failed to initialize state persistence:', error);
      errorHandler.logError(error, 'state_persistence_init');
    }
  }
  
  /**
   * Setup migration handlers for different state versions
   */
  setupMigrationHandlers() {
    // Example migration handler (for future use)
    this.migrationHandlers.set('0.9.0', (oldState) => {
      // Migrate from version 0.9.0 to 1.0.0
      return {
        ...oldState,
        // Add migration logic here
      };
    });
  }
  
  /**
   * Handle state migration if needed
   */
  handleStateMigration() {
    try {
      const storedVersion = localStorage.getItem(STORAGE_KEYS.STATE_VERSION);
      
      if (!storedVersion || storedVersion !== CURRENT_STATE_VERSION) {
        console.log(`🔄 Migrating state from ${storedVersion || 'unknown'} to ${CURRENT_STATE_VERSION}`);
        
        // For now, just clear old state and set new version
        // In the future, add proper migration logic here
        this.clearPersistedState();
        localStorage.setItem(STORAGE_KEYS.STATE_VERSION, CURRENT_STATE_VERSION);
      }
    } catch (error) {
      console.error('State migration failed:', error);
      errorHandler.logError(error, 'state_migration');
      // Clear state on migration failure to prevent corruption
      this.clearPersistedState();
    }
  }
  
  /**
   * Filter state object based on persistence configuration
   */
  filterStateForPersistence(state, config) {
    const filtered = {};
    
    // Include only specified fields
    if (config.persist) {
      config.persist.forEach(key => {
        if (state.hasOwnProperty(key)) {
          filtered[key] = state[key];
        }
      });
    } else {
      // Include all fields if no persist list specified
      Object.assign(filtered, state);
    }
    
    // Exclude specified fields
    if (config.exclude) {
      config.exclude.forEach(key => {
        delete filtered[key];
      });
    }
    
    return filtered;
  }
  
  /**
   * Persist app state to localStorage
   */
  persistAppState(state) {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    this.debouncer.debounce('appState', () => {
      try {
        const filteredState = this.filterStateForPersistence(state, PERSISTENCE_CONFIG.appState);
        
        // Limit navigation history size
        if (filteredState.navigationHistory && filteredState.navigationHistory.length > PERSISTENCE_CONFIG.maxHistorySize) {
          filteredState.navigationHistory = filteredState.navigationHistory.slice(-PERSISTENCE_CONFIG.maxHistorySize);
        }
        
        const serialized = JSON.stringify(filteredState);
        localStorage.setItem(STORAGE_KEYS.APP_STATE, serialized);
        
        console.log('💾 App state persisted');
      } catch (error) {
        console.error('Failed to persist app state:', error);
        errorHandler.logError(error, 'persist_app_state', { stateKeys: Object.keys(state) });
      }
    });
  }
  
  /**
   * Persist list state to localStorage
   */
  persistListState(state) {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    this.debouncer.debounce('listState', () => {
      try {
        const filteredState = this.filterStateForPersistence(state, PERSISTENCE_CONFIG.listState);
        
        // Don't persist optimistic lists
        if (filteredState.lists) {
          filteredState.lists = filteredState.lists.filter(list => !list.isOptimistic);
        }
        
        const serialized = JSON.stringify(filteredState);
        localStorage.setItem(STORAGE_KEYS.LIST_STATE, serialized);
        
        console.log('💾 List state persisted');
      } catch (error) {
        console.error('Failed to persist list state:', error);
        errorHandler.logError(error, 'persist_list_state', { 
          listCount: state.lists?.length || 0 
        });
      }
    });
  }
  
  /**
   * Restore app state from localStorage
   */
  restoreAppState(defaultState) {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APP_STATE);
      if (!stored) {
        console.log('📦 No persisted app state found, using defaults');
        return defaultState;
      }
      
      const parsed = JSON.parse(stored);
      const restored = {
        ...defaultState,
        ...parsed,
        // Always reset these fields on restore
        isLoading: false,
        error: null,
        optimisticOperations: defaultState.optimisticOperations
      };
      
      console.log('📦 App state restored from localStorage');
      return restored;
    } catch (error) {
      console.error('Failed to restore app state:', error);
      errorHandler.logError(error, 'restore_app_state');
      return defaultState;
    }
  }
  
  /**
   * Restore list state from localStorage
   */
  restoreListState(defaultState) {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LIST_STATE);
      if (!stored) {
        console.log('📦 No persisted list state found, using defaults');
        return defaultState;
      }
      
      const parsed = JSON.parse(stored);
      const restored = {
        ...defaultState,
        ...parsed,
        // Always reset these fields on restore
        isLoading: false,
        listsLoading: false,
        error: null,
        listErrors: {},
        optimisticOperations: defaultState.optimisticOperations
      };
      
      // Validate restored lists
      if (restored.lists && Array.isArray(restored.lists)) {
        restored.lists = restored.lists.filter(list => 
          list && typeof list === 'object' && list.id && list.name
        );
      }
      
      console.log('📦 List state restored from localStorage');
      return restored;
    } catch (error) {
      console.error('Failed to restore list state:', error);
      errorHandler.logError(error, 'restore_list_state');
      return defaultState;
    }
  }
  
  /**
   * Clear all persisted state
   */
  clearPersistedState() {
    try {
      localStorage.removeItem(STORAGE_KEYS.APP_STATE);
      localStorage.removeItem(STORAGE_KEYS.LIST_STATE);
      localStorage.removeItem(STORAGE_KEYS.STATE_VERSION);
      
      console.log('🗑️ Persisted state cleared');
    } catch (error) {
      console.error('Failed to clear persisted state:', error);
      errorHandler.logError(error, 'clear_persisted_state');
    }
  }
  
  /**
   * Get storage usage information
   */
  getStorageInfo() {
    try {
      const appStateSize = localStorage.getItem(STORAGE_KEYS.APP_STATE)?.length || 0;
      const listStateSize = localStorage.getItem(STORAGE_KEYS.LIST_STATE)?.length || 0;
      const totalSize = appStateSize + listStateSize;
      
      return {
        appStateSize,
        listStateSize,
        totalSize,
        totalSizeKB: Math.round(totalSize / 1024 * 100) / 100
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        appStateSize: 0,
        listStateSize: 0,
        totalSize: 0,
        totalSizeKB: 0
      };
    }
  }
  
  /**
   * Export state for backup
   */
  exportState() {
    try {
      const appState = localStorage.getItem(STORAGE_KEYS.APP_STATE);
      const listState = localStorage.getItem(STORAGE_KEYS.LIST_STATE);
      const version = localStorage.getItem(STORAGE_KEYS.STATE_VERSION);
      
      return {
        version: version || CURRENT_STATE_VERSION,
        appState: appState ? JSON.parse(appState) : null,
        listState: listState ? JSON.parse(listState) : null,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to export state:', error);
      errorHandler.logError(error, 'export_state');
      return null;
    }
  }
  
  /**
   * Import state from backup
   */
  importState(exportedData) {
    try {
      if (!exportedData || typeof exportedData !== 'object') {
        throw new Error('Invalid export data');
      }
      
      // Clear existing state
      this.clearPersistedState();
      
      // Import state
      if (exportedData.appState) {
        localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(exportedData.appState));
      }
      
      if (exportedData.listState) {
        localStorage.setItem(STORAGE_KEYS.LIST_STATE, JSON.stringify(exportedData.listState));
      }
      
      localStorage.setItem(STORAGE_KEYS.STATE_VERSION, exportedData.version || CURRENT_STATE_VERSION);
      
      console.log('📥 State imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import state:', error);
      errorHandler.logError(error, 'import_state');
      return false;
    }
  }
  
  /**
   * Cleanup resources
   */
  cleanup() {
    this.debouncer.clear();
    this.isInitialized = false;
  }
}

// Create singleton instance
const statePersistence = new StatePersistenceManager();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.statePersistence = statePersistence;
}

export default statePersistence;

/**
 * Higher-order function to create a persistence-aware reducer
 */
export function withPersistence(reducer, persistenceKey) {
  return (state, action) => {
    const newState = reducer(state, action);
    
    // Persist state after each action
    if (persistenceKey === 'app') {
      statePersistence.persistAppState(newState);
    } else if (persistenceKey === 'list') {
      statePersistence.persistListState(newState);
    }
    
    return newState;
  };
}

/**
 * Hook to use state persistence
 */
export function useStatePersistence() {
  return {
    persistAppState: (state) => statePersistence.persistAppState(state),
    persistListState: (state) => statePersistence.persistListState(state),
    restoreAppState: (defaultState) => statePersistence.restoreAppState(defaultState),
    restoreListState: (defaultState) => statePersistence.restoreListState(defaultState),
    clearPersistedState: () => statePersistence.clearPersistedState(),
    getStorageInfo: () => statePersistence.getStorageInfo(),
    exportState: () => statePersistence.exportState(),
    importState: (data) => statePersistence.importState(data)
  };
}