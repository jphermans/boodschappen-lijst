// Enhanced user manager with robust persistence for iOS Safari and cross-platform compatibility
import { persistentStorage } from './persistentStorage';

const USER_NAME_KEY = 'user_name';
const USER_ID_KEY = 'user_id';
const USER_SESSION_KEY = 'user_session';
const USER_PREFERENCES_KEY = 'user_preferences';
const USER_ACTIVITY_KEY = 'user_activity';

class EnhancedUserManager {
  constructor() {
    this.userCache = new Map();
    this.sessionId = this.generateSessionId();
    this.initializeUser();
    this.setupEventListeners();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async initializeUser() {
    try {
      // Load user data from persistent storage
      await this.loadUserData();
      
      // Update session information
      await this.updateSession();
      
      // Log user activity
      await this.logActivity('app_start');
      
      console.log('Enhanced user manager initialized');
    } catch (error) {
      console.error('Failed to initialize user manager:', error);
    }
  }

  async loadUserData() {
    try {
      const userData = await persistentStorage.getItem(USER_NAME_KEY);
      const userId = await persistentStorage.getItem(USER_ID_KEY);
      const preferences = await persistentStorage.getItem(USER_PREFERENCES_KEY);
      
      if (userData) {
        this.userCache.set('name', userData);
      }
      
      if (userId) {
        this.userCache.set('id', userId);
      } else {
        // Generate new user ID if none exists
        const newUserId = this.generateUserId();
        this.userCache.set('id', newUserId);
        await persistentStorage.setItem(USER_ID_KEY, newUserId, { critical: true });
      }
      
      if (preferences) {
        this.userCache.set('preferences', preferences);
      } else {
        // Set default preferences
        const defaultPreferences = {
          theme: 'auto',
          language: 'nl',
          notifications: true,
          autoSync: true
        };
        this.userCache.set('preferences', defaultPreferences);
        await persistentStorage.setItem(USER_PREFERENCES_KEY, defaultPreferences);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async updateSession() {
    const sessionData = {
      sessionId: this.sessionId,
      startTime: Date.now(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      lastActivity: Date.now()
    };

    await persistentStorage.setItem(USER_SESSION_KEY, sessionData);
    this.userCache.set('session', sessionData);
  }

  async logActivity(activity, data = {}) {
    try {
      const activityLog = await persistentStorage.getItem(USER_ACTIVITY_KEY) || [];
      
      const activityEntry = {
        timestamp: Date.now(),
        sessionId: this.sessionId,
        activity,
        data,
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      activityLog.push(activityEntry);
      
      // Keep only last 100 activities to prevent storage bloat
      if (activityLog.length > 100) {
        activityLog.splice(0, activityLog.length - 100);
      }

      await persistentStorage.setItem(USER_ACTIVITY_KEY, activityLog);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  setupEventListeners() {
    // Track page visibility changes (critical for iOS Safari)
    document.addEventListener('visibilitychange', async () => {
      if (document.hidden) {
        await this.logActivity('page_hidden');
        await this.syncUserData();
      } else {
        await this.logActivity('page_visible');
        await this.loadUserData(); // Reload data when page becomes visible
      }
    });

    // Track focus/blur events
    window.addEventListener('focus', async () => {
      await this.logActivity('window_focus');
      await this.loadUserData();
    });

    window.addEventListener('blur', async () => {
      await this.logActivity('window_blur');
      await this.syncUserData();
    });

    // Track before unload
    window.addEventListener('beforeunload', async () => {
      await this.logActivity('page_unload');
      await this.syncUserData();
    });

    // Periodic sync every 10 seconds
    setInterval(async () => {
      await this.syncUserData();
    }, 10000);
  }

  async syncUserData() {
    try {
      // Sync all cached user data to persistent storage
      for (const [key, value] of this.userCache.entries()) {
        if (key === 'name') {
          await persistentStorage.setItem(USER_NAME_KEY, value, { critical: true });
        } else if (key === 'id') {
          await persistentStorage.setItem(USER_ID_KEY, value, { critical: true });
        } else if (key === 'preferences') {
          await persistentStorage.setItem(USER_PREFERENCES_KEY, value);
        } else if (key === 'session') {
          await persistentStorage.setItem(USER_SESSION_KEY, value);
        }
      }

      // Update last activity
      await this.updateLastActivity();
    } catch (error) {
      console.error('Failed to sync user data:', error);
    }
  }

  async updateLastActivity() {
    const session = this.userCache.get('session') || {};
    session.lastActivity = Date.now();
    this.userCache.set('session', session);
    await persistentStorage.setItem(USER_SESSION_KEY, session);
  }

  // Enhanced user name management
  async getUserName() {
    let name = this.userCache.get('name');
    if (!name) {
      name = await persistentStorage.getItem(USER_NAME_KEY);
      if (name) {
        this.userCache.set('name', name);
      }
    }
    return name;
  }

  async setUserName(name) {
    const validation = this.validateUserName(name);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const trimmedName = validation.value;
    
    // Update cache
    this.userCache.set('name', trimmedName);
    
    // Store in persistent storage with high priority
    await persistentStorage.setItem(USER_NAME_KEY, trimmedName, { critical: true });
    
    // Log activity
    await this.logActivity('user_name_set', { name: trimmedName });
    
    // Sync immediately
    await this.syncUserData();
    
    return true;
  }

  async hasUserName() {
    const name = await this.getUserName();
    return name && name.trim().length > 0;
  }

  async clearUserName() {
    this.userCache.delete('name');
    await persistentStorage.removeItem(USER_NAME_KEY);
    await this.logActivity('user_name_cleared');
  }

  async getUserId() {
    let id = this.userCache.get('id');
    if (!id) {
      id = await persistentStorage.getItem(USER_ID_KEY);
      if (!id) {
        id = this.generateUserId();
        this.userCache.set('id', id);
        await persistentStorage.setItem(USER_ID_KEY, id, { critical: true });
      } else {
        this.userCache.set('id', id);
      }
    }
    return id;
  }

  async getUserInfo() {
    const name = await this.getUserName();
    const id = await this.getUserId();
    const preferences = this.userCache.get('preferences') || {};
    const session = this.userCache.get('session') || {};

    return {
      name: name || null,
      id,
      hasName: name && name.trim().length > 0,
      preferences,
      session,
      isActive: true
    };
  }

  async getUserPreferences() {
    let preferences = this.userCache.get('preferences');
    if (!preferences) {
      preferences = await persistentStorage.getItem(USER_PREFERENCES_KEY) || {
        theme: 'auto',
        language: 'nl',
        notifications: true,
        autoSync: true
      };
      this.userCache.set('preferences', preferences);
    }
    return preferences;
  }

  async setUserPreference(key, value) {
    const preferences = await this.getUserPreferences();
    preferences[key] = value;
    preferences.lastUpdated = Date.now();
    
    this.userCache.set('preferences', preferences);
    await persistentStorage.setItem(USER_PREFERENCES_KEY, preferences);
    await this.logActivity('preference_updated', { key, value });
  }

  async getUserActivity() {
    return await persistentStorage.getItem(USER_ACTIVITY_KEY) || [];
  }

  async getStorageHealth() {
    const health = persistentStorage.getStorageHealth();
    const userDataSize = this.userCache.size;
    
    return {
      ...health,
      userDataSize,
      lastSync: Date.now(),
      sessionId: this.sessionId
    };
  }

  // Enhanced validation with more comprehensive checks
  validateUserName(name) {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Naam is verplicht' };
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length === 0) {
      return { valid: false, error: 'Naam mag niet leeg zijn' };
    }

    if (trimmedName.length < 2) {
      return { valid: false, error: 'Naam moet minimaal 2 karakters lang zijn' };
    }

    if (trimmedName.length > 50) {
      return { valid: false, error: 'Naam mag maximaal 50 karakters lang zijn' };
    }

    // Enhanced character validation including international characters
    if (!/^[a-zA-Z0-9\s\-_.àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽž]+$/i.test(trimmedName)) {
      return { valid: false, error: 'Naam bevat ongeldige karakters' };
    }

    // Check for inappropriate content (basic filter)
    const inappropriateWords = ['admin', 'system', 'null', 'undefined', 'anonymous'];
    if (inappropriateWords.some(word => trimmedName.toLowerCase().includes(word))) {
      return { valid: false, error: 'Deze naam is niet toegestaan' };
    }

    return { valid: true, value: trimmedName };
  }

  // Recovery methods for data loss scenarios
  async recoverUserData() {
    console.log('Attempting to recover user data...');
    
    try {
      // Try to recover from different storage mechanisms
      const recoveredData = {};
      
      // Check all storage mechanisms
      const storageHealth = await this.getStorageHealth();
      console.log('Storage health:', storageHealth);
      
      // Attempt recovery from each available storage
      for (const storageType of Object.keys(storageHealth.available)) {
        if (storageHealth.available[storageType]) {
          console.log(`Attempting recovery from ${storageType}...`);
          // Recovery logic would go here
        }
      }
      
      return recoveredData;
    } catch (error) {
      console.error('Data recovery failed:', error);
      return null;
    }
  }

  // Export user data for backup
  async exportUserData() {
    const userData = await this.getUserInfo();
    const preferences = await this.getUserPreferences();
    const activity = await this.getUserActivity();
    const storageHealth = await this.getStorageHealth();
    
    return {
      userData,
      preferences,
      activity: activity.slice(-10), // Last 10 activities only
      storageHealth,
      exportTimestamp: Date.now(),
      version: '2.0'
    };
  }

  // Import user data from backup
  async importUserData(backupData) {
    try {
      if (backupData.userData && backupData.userData.name) {
        await this.setUserName(backupData.userData.name);
      }
      
      if (backupData.preferences) {
        this.userCache.set('preferences', backupData.preferences);
        await persistentStorage.setItem(USER_PREFERENCES_KEY, backupData.preferences);
      }
      
      await this.logActivity('data_imported', { 
        importTimestamp: Date.now(),
        originalExportTimestamp: backupData.exportTimestamp 
      });
      
      return true;
    } catch (error) {
      console.error('Data import failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const enhancedUserManager = new EnhancedUserManager();

// Export for backward compatibility
export const userManager = {
  getUserName: () => enhancedUserManager.getUserName(),
  setUserName: (name) => enhancedUserManager.setUserName(name),
  hasUserName: () => enhancedUserManager.hasUserName(),
  clearUserName: () => enhancedUserManager.clearUserName(),
  getUserInfo: () => enhancedUserManager.getUserInfo(),
  validateUserName: (name) => enhancedUserManager.validateUserName(name)
};