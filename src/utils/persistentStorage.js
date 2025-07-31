// Enhanced persistent storage for iOS Safari and cross-platform compatibility
// Handles aggressive memory management and provides multiple fallback mechanisms

const STORAGE_PREFIX = 'boodschappenlijst_v2_';
const BACKUP_PREFIX = 'boodschappenlijst_backup_';
const SESSION_PREFIX = 'boodschappenlijst_session_';

// Multiple storage strategies for maximum persistence
class PersistentStorage {
  constructor() {
    this.storageStrategies = [
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'cookieStorage',
      'memoryStorage'
    ];
    
    this.memoryCache = new Map();
    this.initializeStorage();
  }

  async initializeStorage() {
    // Test storage availability
    this.availableStorage = {};
    
    // Test localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      this.availableStorage.localStorage = true;
    } catch (e) {
      this.availableStorage.localStorage = false;
    }

    // Test sessionStorage
    try {
      sessionStorage.setItem('test', 'test');
      sessionStorage.removeItem('test');
      this.availableStorage.sessionStorage = true;
    } catch (e) {
      this.availableStorage.sessionStorage = false;
    }

    // Test IndexedDB
    try {
      this.availableStorage.indexedDB = 'indexedDB' in window;
      if (this.availableStorage.indexedDB) {
        await this.initIndexedDB();
      }
    } catch (e) {
      this.availableStorage.indexedDB = false;
    }

    // Cookie storage is always available
    this.availableStorage.cookieStorage = true;
    this.availableStorage.memoryStorage = true;

    console.log('Available storage mechanisms:', this.availableStorage);
  }

  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BoodschappenlijstDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('userData')) {
          db.createObjectStore('userData', { keyPath: 'key' });
        }
      };
    });
  }

  // Enhanced encryption with multiple layers
  encrypt(data) {
    try {
      const jsonString = JSON.stringify(data);
      const timestamp = Date.now().toString();
      const combined = `${timestamp}:${jsonString}`;
      
      // Simple XOR encryption
      const key = 'boodschappenlijst_secure_v2_2024';
      let encrypted = '';
      for (let i = 0; i < combined.length; i++) {
        encrypted += String.fromCharCode(
          combined.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      return JSON.stringify(data);
    }
  }

  decrypt(encryptedData) {
    try {
      // First, check if it's plain JSON (unencrypted legacy data)
      try {
        return JSON.parse(encryptedData);
      } catch {
        // Continue with decryption if it's not plain JSON
      }

      // Skip decryption if data doesn't look like base64
      if (!/^[A-Za-z0-9+/=]+$/.test(encryptedData.trim())) {
        console.warn('Data doesn\'t appear to be base64 encrypted, attempting direct JSON parse');
        try {
          return JSON.parse(encryptedData);
        } catch {
          return null;
        }
      }

      const decoded = atob(encryptedData);
      const key = 'boodschappenlijst_secure_v2_2024';
      let decrypted = '';
      
      for (let i = 0; i < decoded.length; i++) {
        decrypted += String.fromCharCode(
          decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      
      // Handle cases where the data might not have the expected format
      const parts = decrypted.split(':', 2);
      if (parts.length !== 2) {
        console.warn('Invalid encrypted data format, attempting direct JSON parse');
        try {
          return JSON.parse(decrypted);
        } catch {
          return null;
        }
      }
      
      const [, jsonString] = parts;
      try {
        return JSON.parse(jsonString);
      } catch {
        return null;
      }
    } catch (error) {
      console.error('Decryption failed:', error);
      // Return null for corrupted data instead of throwing
      return null;
    }
  }

  // Store data across multiple storage mechanisms
  async setItem(key, value, options = {}) {
    const fullKey = STORAGE_PREFIX + key;
    const backupKey = BACKUP_PREFIX + key;
    const sessionKey = SESSION_PREFIX + key;
    const encryptedValue = this.encrypt(value);
    
    const metadata = {
      timestamp: Date.now(),
      version: '2.0',
      userAgent: navigator.userAgent,
      persistent: options.persistent !== false
    };

    const dataPackage = {
      value: encryptedValue,
      metadata
    };

    // Store in memory cache first
    this.memoryCache.set(key, value);

    const promises = [];

    // Store in localStorage with backup
    if (this.availableStorage.localStorage) {
      try {
        localStorage.setItem(fullKey, JSON.stringify(dataPackage));
        localStorage.setItem(backupKey, JSON.stringify(dataPackage));
      } catch (e) {
        console.warn('localStorage failed:', e);
      }
    }

    // Store in sessionStorage
    if (this.availableStorage.sessionStorage) {
      try {
        sessionStorage.setItem(sessionKey, JSON.stringify(dataPackage));
      } catch (e) {
        console.warn('sessionStorage failed:', e);
      }
    }

    // Store in IndexedDB
    if (this.availableStorage.indexedDB && this.db) {
      promises.push(this.setIndexedDBItem(key, dataPackage));
    }

    // Store in cookies for critical data
    if (options.critical) {
      this.setCookie(key, encryptedValue, 365);
    }

    await Promise.allSettled(promises);
    return true;
  }

  async setIndexedDBItem(key, dataPackage) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['userData'], 'readwrite');
      const store = transaction.objectStore('userData');
      const request = store.put({ key, data: dataPackage });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Retrieve data with fallback mechanisms
  async getItem(key) {
    console.log('PersistentStorage.getItem called with key:', key);
    
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      console.log('Found in memory cache:', key);
      return this.memoryCache.get(key);
    }

    const fullKey = STORAGE_PREFIX + key;
    const backupKey = BACKUP_PREFIX + key;
    const sessionKey = SESSION_PREFIX + key;
    
    console.log('Storage keys:', { fullKey, backupKey, sessionKey });

    let dataPackage = null;

    // Try localStorage first
    if (this.availableStorage.localStorage) {
      try {
        const stored = localStorage.getItem(fullKey);
        console.log('localStorage.getItem result:', stored ? 'data found' : 'no data', 'length:', stored ? stored.length : 0);
        if (stored) {
          try {
            dataPackage = JSON.parse(stored);
            console.log('Successfully parsed localStorage data package');
          } catch (parseError) {
            console.warn('JSON parse failed for localStorage item:', parseError);
            // Try to parse as plain text if JSON fails
            try {
              const plainValue = this.decrypt(stored);
              if (plainValue !== null) {
                console.log('Successfully decrypted plain localStorage data');
                this.memoryCache.set(key, plainValue);
                return plainValue;
              }
            } catch (decryptError) {
              console.warn('Decryption failed for localStorage item:', decryptError);
            }
          }
        }
      } catch (e) {
        console.warn('localStorage read failed:', e);
      }
    }

    // Try backup localStorage
    if (!dataPackage && this.availableStorage.localStorage) {
      try {
        const stored = localStorage.getItem(backupKey);
        if (stored) {
          try {
            dataPackage = JSON.parse(stored);
          } catch (parseError) {
            console.warn('JSON parse failed for backup localStorage item:', parseError);
            // Try to parse as plain text if JSON fails
            try {
              const plainValue = this.decrypt(stored);
              if (plainValue !== null) {
                this.memoryCache.set(key, plainValue);
                return plainValue;
              }
            } catch (decryptError) {
              console.warn('Decryption failed for backup localStorage item:', decryptError);
            }
          }
        }
      } catch (e) {
        console.warn('localStorage backup read failed:', e);
      }
    }

    // Try sessionStorage
    if (!dataPackage && this.availableStorage.sessionStorage) {
      try {
        const stored = sessionStorage.getItem(sessionKey);
        if (stored) {
          try {
            dataPackage = JSON.parse(stored);
          } catch (parseError) {
            console.warn('JSON parse failed for sessionStorage item:', parseError);
            // Try to parse as plain text if JSON fails
            try {
              const plainValue = this.decrypt(stored);
              if (plainValue !== null) {
                this.memoryCache.set(key, plainValue);
                return plainValue;
              }
            } catch (decryptError) {
              console.warn('Decryption failed for sessionStorage item:', decryptError);
            }
          }
        }
      } catch (e) {
        console.warn('sessionStorage read failed:', e);
      }
    }

    // Try IndexedDB
    if (!dataPackage && this.availableStorage.indexedDB && this.db) {
      try {
        dataPackage = await this.getIndexedDBItem(key);
      } catch (e) {
        console.warn('IndexedDB read failed:', e);
      }
    }

    // Try cookies
    if (!dataPackage) {
      const cookieValue = this.getCookie(key);
      if (cookieValue) {
        try {
          const decryptedValue = this.decrypt(cookieValue);
          if (decryptedValue !== null) {
            this.memoryCache.set(key, decryptedValue);
            return decryptedValue;
          }
        } catch (decryptError) {
          console.warn('Decryption failed for cookie item:', decryptError);
        }
      }
    }

    if (dataPackage) {
      try {
        const decryptedValue = this.decrypt(dataPackage.value);
        if (decryptedValue !== null) {
          // Update memory cache
          this.memoryCache.set(key, decryptedValue);
          return decryptedValue;
        } else {
          console.warn('Decryption returned null for key:', key);
        }
      } catch (decryptError) {
        console.warn('Decryption process failed:', decryptError);
      }
    }

    return null;
  }

  async getIndexedDBItem(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['userData'], 'readonly');
      const store = transaction.objectStore('userData');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Cookie storage for critical data
  setCookie(key, value, days) {
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      const cookieValue = `${STORAGE_PREFIX}${key}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
      document.cookie = cookieValue;
    } catch (e) {
      console.warn('Cookie storage failed:', e);
    }
  }

  getCookie(key) {
    try {
      const name = `${STORAGE_PREFIX}${key}=`;
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookies = decodedCookie.split(';');
      
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(name) === 0) {
          return cookie.substring(name.length);
        }
      }
    } catch (e) {
      console.warn('Cookie read failed:', e);
    }
    return null;
  }

  // Remove item from all storage mechanisms
  async removeItem(key) {
    const fullKey = STORAGE_PREFIX + key;
    const backupKey = BACKUP_PREFIX + key;
    const sessionKey = SESSION_PREFIX + key;

    // Remove from memory cache
    this.memoryCache.delete(key);

    // Remove from localStorage
    if (this.availableStorage.localStorage) {
      try {
        localStorage.removeItem(fullKey);
        localStorage.removeItem(backupKey);
      } catch (e) {
        console.warn('localStorage removal failed:', e);
      }
    }

    // Remove from sessionStorage
    if (this.availableStorage.sessionStorage) {
      try {
        sessionStorage.removeItem(sessionKey);
      } catch (e) {
        console.warn('sessionStorage removal failed:', e);
      }
    }

    // Remove from IndexedDB
    if (this.availableStorage.indexedDB && this.db) {
      try {
        await this.removeIndexedDBItem(key);
      } catch (e) {
        console.warn('IndexedDB removal failed:', e);
      }
    }

    // Remove cookie
    this.setCookie(key, '', -1);
  }

  async removeIndexedDBItem(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['userData'], 'readwrite');
      const store = transaction.objectStore('userData');
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sync data across storage mechanisms
  async syncStorage() {
    console.log('Syncing storage mechanisms...');
    
    for (const [key, value] of this.memoryCache.entries()) {
      await this.setItem(key, value, { critical: true });
    }
  }

  // Get storage health information
  async getStorageHealth() {
    return {
      available: this.availableStorage,
      memoryCache: this.memoryCache.size,
      timestamp: Date.now()
    };
  }

  // Clear corrupted storage data
  async clearCorruptedData() {
    console.log('Clearing potentially corrupted storage data...');
    
    // Clear all storage mechanisms
    const keysToClear = [
      'unified_color_theme',
      'default_theme_preference',
      'user_state',
      'shopping_lists',
      'user_name',
      'device_uid'
    ];

    for (const key of keysToClear) {
      try {
        await this.removeItem(key);
        console.log(`Cleared key: ${key}`);
      } catch (e) {
        console.warn(`Failed to clear key ${key}:`, e);
      }
    }

    // Clear all storage types completely
    if (this.availableStorage.localStorage) {
      try {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith(STORAGE_PREFIX) || key.startsWith(BACKUP_PREFIX)) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.warn('Failed to clear localStorage:', e);
      }
    }

    if (this.availableStorage.sessionStorage) {
      try {
        const keys = Object.keys(sessionStorage);
        for (const key of keys) {
          if (key.startsWith(SESSION_PREFIX)) {
            sessionStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.warn('Failed to clear sessionStorage:', e);
      }
    }

    // Clear IndexedDB
    if (this.availableStorage.indexedDB && this.db) {
      try {
        const transaction = this.db.transaction(['userData'], 'readwrite');
        const store = transaction.objectStore('userData');
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => console.log('IndexedDB cleared');
        clearRequest.onerror = () => console.warn('Failed to clear IndexedDB');
      } catch (e) {
        console.warn('Failed to clear IndexedDB:', e);
      }
    }

    // Clear cookies
    try {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.startsWith(STORAGE_PREFIX)) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
      }
    } catch (e) {
      console.warn('Failed to clear cookies:', e);
    }

    // Clear memory cache
    this.memoryCache.clear();
    console.log('Storage cleanup completed');
  }
}

// Create singleton instance
export const persistentStorage = new PersistentStorage();

// Initialize storage when module loads
persistentStorage.initializeStorage().catch(console.error);

// Sync storage periodically and on page visibility changes
if (typeof window !== 'undefined') {
  // Sync on visibility change (iOS Safari focus/blur)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      persistentStorage.syncStorage().catch(console.error);
    }
  });

  // Sync on page focus/blur
  window.addEventListener('focus', () => {
    persistentStorage.syncStorage().catch(console.error);
  });

  // Sync before page unload
  window.addEventListener('beforeunload', () => {
    persistentStorage.syncStorage().catch(console.error);
  });

  // Periodic sync every 30 seconds
  setInterval(() => {
    persistentStorage.syncStorage().catch(console.error);
  }, 30000);
  
  // Add global storage clear function for debugging
  window.clearAllStorage = async () => {
    console.log('Clearing all storage...');
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      if ('indexedDB' in window) {
        indexedDB.deleteDatabase('BoodschappenlijstDB').catch(console.warn);
      }
      
      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      });
      
      console.log('All storage cleared');
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  };
}