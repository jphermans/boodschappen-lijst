// Comprehensive state management system for cross-platform persistence
import { persistentStorage } from './persistentStorage';
import { enhancedUserManager } from './enhancedUserManager';

const STATE_KEY = 'app_state';
const LISTS_KEY = 'shopping_lists';
const THEME_KEY = 'theme_state';
const UI_STATE_KEY = 'ui_state';

class StateManager {
  constructor() {
    this.state = new Map();
    this.subscribers = new Map();
    this.syncQueue = [];
    this.isSyncing = false;
    this.lastSyncTime = 0;
    this.syncInterval = 5000; // 5 seconds
    
    this.initialize();
  }

  async initialize() {
    try {
      console.log('Initializing state manager...');
      
      // Load initial state from persistent storage
      await this.loadState();
      
      // Setup event listeners for state persistence
      this.setupEventListeners();
      
      // Start periodic sync
      this.startPeriodicSync();
      
      console.log('State manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize state manager:', error);
    }
  }

  async loadState() {
    try {
      // Load different state categories
      const appState = await persistentStorage.getItem(STATE_KEY) || {};
      const listsState = await persistentStorage.getItem(LISTS_KEY) || [];
      const themeState = await persistentStorage.getItem(THEME_KEY) || { theme: 'light' };
      const uiState = await persistentStorage.getItem(UI_STATE_KEY) || {};

      // Set initial state
      this.state.set('app', appState);
      this.state.set('lists', listsState);
      this.state.set('theme', themeState);
      this.state.set('ui', uiState);

      // Load user state
      const userInfo = await enhancedUserManager.getUserInfo();
      this.state.set('user', userInfo);

      console.log('State loaded:', {
        app: Object.keys(appState).length,
        lists: listsState.length,
        theme: themeState.theme,
        ui: Object.keys(uiState).length,
        user: userInfo.hasName
      });
    } catch (error) {
      console.error('Failed to load state:', error);
      // Initialize with default state
      this.initializeDefaultState();
    }
  }

  initializeDefaultState() {
    this.state.set('app', {
      version: '2.0',
      initialized: true,
      lastAccess: Date.now()
    });
    this.state.set('lists', []);
    this.state.set('theme', { theme: 'light' });
    this.state.set('ui', {
      selectedList: null,
      showSettings: false,
      showShare: false,
      showScanner: false
    });
    this.state.set('user', {
      name: null,
      hasName: false,
      isActive: false
    });
  }

  setupEventListeners() {
    // Handle page visibility changes (critical for iOS Safari)
    document.addEventListener('visibilitychange', async () => {
      if (document.hidden) {
        await this.syncState('page_hidden');
      } else {
        await this.loadState(); // Reload state when page becomes visible
        this.notifySubscribers('state_reloaded');
      }
    });

    // Handle focus/blur events
    window.addEventListener('focus', async () => {
      await this.loadState();
      this.notifySubscribers('state_reloaded');
    });

    window.addEventListener('blur', async () => {
      await this.syncState('window_blur');
    });

    // Handle before unload
    window.addEventListener('beforeunload', async () => {
      await this.syncState('page_unload');
    });

    // Handle storage events (for cross-tab synchronization)
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.includes('boodschappenlijst_v2_')) {
        console.log('Storage event detected, reloading state...');
        this.loadState().then(() => {
          this.notifySubscribers('storage_changed');
        });
      }
    });
  }

  startPeriodicSync() {
    setInterval(async () => {
      if (!this.isSyncing && Date.now() - this.lastSyncTime > this.syncInterval) {
        await this.syncState('periodic');
      }
    }, this.syncInterval);
  }

  // Subscribe to state changes
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // Notify subscribers of state changes
  notifySubscribers(key, data = null) {
    const callbacks = this.subscribers.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Subscriber callback error:', error);
        }
      });
    }

    // Also notify global subscribers
    const globalCallbacks = this.subscribers.get('*');
    if (globalCallbacks) {
      globalCallbacks.forEach(callback => {
        try {
          callback({ key, data });
        } catch (error) {
          console.error('Global subscriber callback error:', error);
        }
      });
    }
  }

  // Get state value
  getState(key) {
    return this.state.get(key);
  }

  // Set state value with automatic persistence
  async setState(key, value, options = {}) {
    const oldValue = this.state.get(key);
    this.state.set(key, value);

    // Add to sync queue if not immediate
    if (!options.immediate) {
      this.syncQueue.push({ key, value, timestamp: Date.now() });
    } else {
      await this.persistState(key, value);
    }

    // Notify subscribers
    this.notifySubscribers(key, { oldValue, newValue: value });

    return true;
  }

  // Update specific part of state
  async updateState(key, updater, options = {}) {
    const currentValue = this.state.get(key);
    const newValue = typeof updater === 'function' ? updater(currentValue) : updater;
    return await this.setState(key, newValue, options);
  }

  // Persist state to storage
  async persistState(key, value) {
    try {
      let storageKey;
      let critical = false;

      switch (key) {
        case 'lists':
          storageKey = LISTS_KEY;
          critical = true;
          break;
        case 'theme':
          storageKey = THEME_KEY;
          break;
        case 'ui':
          storageKey = UI_STATE_KEY;
          break;
        case 'user':
          // User state is handled by enhancedUserManager
          return;
        default:
          storageKey = STATE_KEY;
      }

      await persistentStorage.setItem(storageKey, value, { critical });
    } catch (error) {
      console.error(`Failed to persist state for key ${key}:`, error);
    }
  }

  // Sync all pending state changes
  async syncState(reason = 'manual') {
    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    console.log(`Syncing state (reason: ${reason})...`);

    try {
      // Process sync queue
      const queueCopy = [...this.syncQueue];
      this.syncQueue = [];

      for (const { key, value } of queueCopy) {
        await this.persistState(key, value);
      }

      // Sync current state
      for (const [key, value] of this.state.entries()) {
        await this.persistState(key, value);
      }

      this.lastSyncTime = Date.now();
      console.log('State sync completed');
    } catch (error) {
      console.error('State sync failed:', error);
      // Re-add failed items to queue
      this.syncQueue.unshift(...this.syncQueue);
    } finally {
      this.isSyncing = false;
    }
  }

  // Shopping lists specific methods
  async addList(list) {
    const lists = this.getState('lists') || [];
    const newList = {
      ...list,
      id: list.id || `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updatedLists = [...lists, newList];
    await this.setState('lists', updatedLists, { immediate: true });
    
    return newList;
  }

  async updateList(listId, updates) {
    const lists = this.getState('lists') || [];
    const updatedLists = lists.map(list => 
      list.id === listId 
        ? { ...list, ...updates, updatedAt: Date.now() }
        : list
    );

    await this.setState('lists', updatedLists, { immediate: true });
    return updatedLists.find(list => list.id === listId);
  }

  async removeList(listId) {
    const lists = this.getState('lists') || [];
    const updatedLists = lists.filter(list => list.id !== listId);
    await this.setState('lists', updatedLists, { immediate: true });
    return true;
  }

  async getList(listId) {
    const lists = this.getState('lists') || [];
    return lists.find(list => list.id === listId);
  }

  // Theme management
  async setTheme(theme) {
    const themeState = { theme, updatedAt: Date.now() };
    await this.setState('theme', themeState, { immediate: true });
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    
    return theme;
  }

  getTheme() {
    const themeState = this.getState('theme') || { theme: 'light' };
    return themeState.theme;
  }

  // UI state management
  async setUIState(key, value) {
    const uiState = this.getState('ui') || {};
    const updatedUIState = { ...uiState, [key]: value };
    await this.setState('ui', updatedUIState);
    return value;
  }

  getUIState(key) {
    const uiState = this.getState('ui') || {};
    return uiState[key];
  }

  // Recovery and backup methods
  async createBackup() {
    const backup = {
      timestamp: Date.now(),
      version: '2.0',
      state: Object.fromEntries(this.state.entries()),
      userInfo: await enhancedUserManager.getUserInfo(),
      storageHealth: await persistentStorage.getStorageHealth()
    };

    return backup;
  }

  async restoreFromBackup(backup) {
    try {
      if (!backup || !backup.state) {
        throw new Error('Invalid backup data');
      }

      // Restore state
      for (const [key, value] of Object.entries(backup.state)) {
        this.state.set(key, value);
        await this.persistState(key, value);
      }

      // Restore user info if available
      if (backup.userInfo && backup.userInfo.name) {
        await enhancedUserManager.setUserName(backup.userInfo.name);
      }

      // Notify subscribers
      this.notifySubscribers('state_restored', backup);

      console.log('State restored from backup');
      return true;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return false;
    }
  }

  // Get comprehensive state information
  async getStateInfo() {
    const userInfo = await enhancedUserManager.getUserInfo();
    const storageHealth = await persistentStorage.getStorageHealth();
    
    return {
      state: Object.fromEntries(this.state.entries()),
      userInfo,
      storageHealth,
      syncQueue: this.syncQueue.length,
      lastSyncTime: this.lastSyncTime,
      isSyncing: this.isSyncing,
      subscribers: Array.from(this.subscribers.keys())
    };
  }

  // Reset all state (for debugging/testing)
  async resetState() {
    console.warn('Resetting all state...');
    
    this.state.clear();
    this.syncQueue = [];
    
    // Clear persistent storage
    await persistentStorage.removeItem(STATE_KEY);
    await persistentStorage.removeItem(LISTS_KEY);
    await persistentStorage.removeItem(THEME_KEY);
    await persistentStorage.removeItem(UI_STATE_KEY);
    
    // Clear user data
    await enhancedUserManager.clearUserName();
    
    // Initialize default state
    this.initializeDefaultState();
    
    // Notify subscribers
    this.notifySubscribers('state_reset');
    
    return true;
  }
}

// Create singleton instance
export const stateManager = new StateManager();

// Export convenience methods
export const useAppState = () => ({
  getState: (key) => stateManager.getState(key),
  setState: (key, value, options) => stateManager.setState(key, value, options),
  updateState: (key, updater, options) => stateManager.updateState(key, updater, options),
  subscribe: (key, callback) => stateManager.subscribe(key, callback),
  syncState: () => stateManager.syncState('manual'),
  createBackup: () => stateManager.createBackup(),
  restoreFromBackup: (backup) => stateManager.restoreFromBackup(backup),
  getStateInfo: () => stateManager.getStateInfo()
});

// Export list management methods
export const useListState = () => ({
  addList: (list) => stateManager.addList(list),
  updateList: (listId, updates) => stateManager.updateList(listId, updates),
  removeList: (listId) => stateManager.removeList(listId),
  getList: (listId) => stateManager.getList(listId),
  getLists: () => stateManager.getState('lists') || []
});

// Export theme management methods
export const useThemeState = () => ({
  setTheme: (theme) => stateManager.setTheme(theme),
  getTheme: () => stateManager.getTheme(),
  subscribe: (callback) => stateManager.subscribe('theme', callback)
});