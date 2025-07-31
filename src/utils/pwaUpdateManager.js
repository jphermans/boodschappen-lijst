// PWA Update Manager
class PWAUpdateManager {
  constructor() {
    this.registration = null;
    this.updateAvailable = false;
    this.onUpdateAvailable = null;
    this.onUpdateInstalled = null;
    this.onUpdateError = null;
    this.currentVersion = null;
    this.latestVersion = null;
    
    this.init();
  }

  async init() {
    if ('serviceWorker' in navigator) {
      try {
        console.log('PWA Update Manager: Initializing...');
        
        // Register service worker
        this.registration = await navigator.serviceWorker.register('./sw.js', {
          scope: './',
          updateViaCache: 'none' // Ensure service worker updates are not cached
        });
        
        console.log('PWA Update Manager: Service Worker registered successfully');
        
        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          console.log('PWA Update Manager: Update found!');
          this.handleUpdateFound();
        });
        
        // Check if there's already an update waiting
        if (this.registration.waiting) {
          console.log('PWA Update Manager: Update already waiting');
          this.showUpdateAvailable();
        }
        
        // Listen for controller changes (when new SW takes control)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('PWA Update Manager: Controller changed, reloading...');
          if (this.onUpdateInstalled) {
            this.onUpdateInstalled();
          } else {
            window.location.reload();
          }
        });
        
        // Check for updates periodically
        this.startUpdateCheck();
        
      } catch (error) {
        console.error('PWA Update Manager: Service Worker registration failed:', error);
        if (this.onUpdateError) {
          this.onUpdateError(error);
        }
      }
    } else {
      console.log('PWA Update Manager: Service Workers not supported');
    }
  }

  handleUpdateFound() {
    const newWorker = this.registration.installing;
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New update available
          console.log('PWA Update Manager: New content available');
          this.showUpdateAvailable();
        } else {
          // First time install
          console.log('PWA Update Manager: Content cached for offline use');
        }
      }
    });
  }

  showUpdateAvailable() {
    this.updateAvailable = true;
    if (this.onUpdateAvailable) {
      this.onUpdateAvailable();
    }
  }

  // Force update by telling the waiting SW to skip waiting
  async applyUpdate() {
    if (!this.registration || !this.registration.waiting) {
      console.log('PWA Update Manager: No update waiting');
      return false;
    }

    console.log('PWA Update Manager: Applying update...');
    
    // Tell the waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    return true;
  }

  // Check for updates manually
  async checkForUpdates() {
    console.log('PWA Update Manager: Checking for updates...');
    
    try {
      // First check version-based update
      const versionUpdateAvailable = await this.checkVersionUpdate();
      
      if (!this.registration) {
        console.log('PWA Update Manager: No registration available, using version check only');
        return versionUpdateAvailable;
      }

      // Force update check by bypassing cache
      await this.registration.update();
      
      // Check if there's a waiting service worker after update
      if (this.registration.waiting) {
        console.log('PWA Update Manager: Update found after manual check');
        this.showUpdateAvailable();
        return true;
      }
      
      // Also check if there's an installing service worker
      if (this.registration.installing) {
        console.log('PWA Update Manager: Update installing after manual check');
        return true;
      }
      
      // Return version-based update result if no service worker update
      if (versionUpdateAvailable) {
        this.showUpdateAvailable();
        return true;
      }
      
      console.log('PWA Update Manager: No updates found');
      return false;
    } catch (error) {
      console.error('PWA Update Manager: Update check failed:', error);
      return false;
    }
  }

  // Start periodic update checks
  startUpdateCheck() {
    // Check for updates every 5 minutes for better responsiveness
    setInterval(() => {
      this.checkForUpdates();
    }, 5 * 60 * 1000);

    // Also check when the page becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => {
          this.checkForUpdates();
        }, 1000); // Small delay to ensure page is fully visible
      }
    });
    
    // Check for updates when the page loads
    setTimeout(() => {
      this.checkForUpdates();
    }, 2000);
  }

  // Get current version info
  async getVersionInfo() {
    // First try to get version from service worker
    if (this.registration && this.registration.active) {
      try {
        const swVersion = await new Promise((resolve, reject) => {
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            if (event.data.type === 'VERSION_INFO') {
              resolve(event.data.version);
            }
          };

          // Set a timeout in case the service worker doesn't respond
          const timeout = setTimeout(() => {
            reject(new Error('Service worker timeout'));
          }, 1000); // Reduced timeout

          messageChannel.port1.onmessage = (event) => {
            clearTimeout(timeout);
            if (event.data.type === 'VERSION_INFO') {
              resolve(event.data.version);
            }
          };

          this.registration.active.postMessage(
            { type: 'GET_VERSION' },
            [messageChannel.port2]
          );
        });
        
        console.log('PWA Update Manager: Got version from service worker:', swVersion);
        return swVersion;
      } catch (error) {
        console.warn('PWA Update Manager: Service worker version fetch failed:', error);
      }
    }

    // Fallback to manifest version
    try {
      const response = await fetch('/manifest.json', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const manifest = await response.json();
      const version = manifest.version || '1.0.0';
      console.log('PWA Update Manager: Got version from manifest:', version);
      return version;
    } catch (error) {
      console.warn('PWA Update Manager: Could not fetch manifest version:', error);
      return '1.0.0';
    }
  }

  // Get version from manifest.json
  async getManifestVersion() {
    try {
      const response = await fetch('/manifest.json');
      const manifest = await response.json();
      return manifest.version || '1.0.0';
    } catch (error) {
      console.warn('Could not fetch manifest version:', error);
      return '1.0.0';
    }
  }

  // Compare version strings (semantic versioning)
  compareVersions(version1, version2) {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;
      
      if (v1part < v2part) return -1;
      if (v1part > v2part) return 1;
    }
    
    return 0;
  }

  // Check if version-based update is needed
  async checkVersionUpdate() {
    try {
      // Get current version
      this.currentVersion = await this.getVersionInfo();
      
      // Get latest version from server (manifest.json)
      const response = await fetch('/manifest.json', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const manifest = await response.json();
      this.latestVersion = manifest.version || '1.0.0';
      
      console.log(`PWA Update Manager: Current version: ${this.currentVersion}, Latest version: ${this.latestVersion}`);
      
      // Compare versions
      const comparison = this.compareVersions(this.currentVersion, this.latestVersion);
      
      if (comparison < 0) {
        console.log('PWA Update Manager: Version update available!');
        this.updateAvailable = true;
        return true;
      }
      
      console.log('PWA Update Manager: Version is up to date');
      return false;
    } catch (error) {
      console.error('PWA Update Manager: Version check failed:', error);
      return false;
    }
  }

  // Get version information object
  async getVersionDetails() {
    try {
      // Always get fresh version information
      const current = await this.getVersionInfo();
      
      // Get latest version from server (manifest.json) with cache busting
      const response = await fetch('/manifest.json', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      const manifest = await response.json();
      const latest = manifest.version || '1.0.0';
      
      // Update internal state
      this.currentVersion = current;
      this.latestVersion = latest;
      
      console.log(`PWA Update Manager: getVersionDetails - Current: ${current}, Latest: ${latest}`);
      
      const updateAvailable = this.compareVersions(current, latest) < 0;
      
      return {
        current,
        latest,
        updateAvailable
      };
    } catch (error) {
      console.error('PWA Update Manager: getVersionDetails failed:', error);
      // Fallback to basic version info
      const current = await this.getVersionInfo();
      return {
        current,
        latest: current,
        updateAvailable: false
      };
    }
  }

  // Force a hard refresh (bypass cache)
  forceRefresh() {
    console.log('PWA Update Manager: Force refreshing...');
    
    // Clear all caches first
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        console.log('PWA Update Manager: Clearing caches:', cacheNames);
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('PWA Update Manager: Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('PWA Update Manager: All caches cleared, reloading...');
        // Hard reload with cache bypass
        window.location.reload(true);
      }).catch(error => {
        console.error('PWA Update Manager: Error clearing caches:', error);
        window.location.reload(true);
      });
    } else {
      // Fallback hard reload
      console.log('PWA Update Manager: No cache API, doing hard reload...');
      window.location.reload(true);
    }
  }

  // Force clear all caches and unregister service worker (for debugging)
  async forceClearAll() {
    console.log('PWA Update Manager: Force clearing everything...');
    
    try {
      // Unregister service worker
      if (this.registration) {
        await this.registration.unregister();
        console.log('PWA Update Manager: Service worker unregistered');
      }
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log('PWA Update Manager: Clearing all caches:', cacheNames);
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        console.log('PWA Update Manager: All caches cleared');
      }
      
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('PWA Update Manager: Everything cleared, reloading...');
      window.location.reload(true);
    } catch (error) {
      console.error('PWA Update Manager: Error during force clear:', error);
      window.location.reload(true);
    }
  }
  
  // Check if update is available (for manual checking)
  isUpdateAvailable() {
    return this.updateAvailable ||
           (this.registration && this.registration.waiting) ||
           (this.registration && this.registration.installing);
  }

  // Unregister service worker (for debugging)
  async unregister() {
    if (this.registration) {
      const result = await this.registration.unregister();
      console.log('PWA Update Manager: Service Worker unregistered:', result);
      return result;
    }
    return false;
  }
}

// Create singleton instance
const pwaUpdateManager = new PWAUpdateManager();

export default pwaUpdateManager;