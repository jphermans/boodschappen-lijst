// PWA Update Manager
class PWAUpdateManager {
  constructor() {
    this.registration = null;
    this.updateAvailable = false;
    this.onUpdateAvailable = null;
    this.onUpdateInstalled = null;
    this.onUpdateError = null;
    
    this.init();
  }

  async init() {
    if ('serviceWorker' in navigator) {
      try {
        console.log('PWA Update Manager: Initializing...');
        
        // Register service worker
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: './'
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
    if (!this.registration) {
      console.log('PWA Update Manager: No registration available');
      return false;
    }

    console.log('PWA Update Manager: Checking for updates...');
    
    try {
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
    if (!this.registration || !this.registration.active) {
      return null;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'VERSION_INFO') {
          resolve(event.data.version);
        }
      };

      this.registration.active.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
    });
  }

  // Force a hard refresh (bypass cache)
  forceRefresh() {
    console.log('PWA Update Manager: Force refreshing...');
    
    // Clear all caches first
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        // Hard reload with cache bypass
        window.location.reload();
      });
    } else {
      // Fallback hard reload
      window.location.reload();
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