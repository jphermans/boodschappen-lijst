import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw, X, Smartphone } from 'lucide-react';
import pwaUpdateManager from '../utils/pwaUpdateManager';
import { useToast } from '../context/ToastContext';

const PWAUpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const { success, info, error } = useToast();

  useEffect(() => {
    // Set up PWA update manager callbacks
    pwaUpdateManager.onUpdateAvailable = () => {
      console.log('PWA Update: Update available notification received');
      setUpdateAvailable(true);
      info('🔄 Nieuwe versie beschikbaar! Klik om bij te werken.', 5000);
    };

    pwaUpdateManager.onUpdateInstalled = () => {
      console.log('PWA Update: Update installed successfully');
      setIsUpdating(false);
      setUpdateAvailable(false);
      success('✅ App bijgewerkt! Nieuwe functies zijn nu beschikbaar.', 3000);
    };

    pwaUpdateManager.onUpdateError = (err) => {
      console.error('PWA Update: Update error:', err);
      setIsUpdating(false);
      error('❌ Update mislukt. Probeer de pagina te vernieuwen.', 5000);
    };

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA Install: Install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA Install: App installed successfully');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      success('📱 App geïnstalleerd! Je kunt het nu vanaf je startscherm gebruiken.', 4000);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [success, info, error]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    info('🔄 App wordt bijgewerkt...', 2000);
    
    try {
      const success = await pwaUpdateManager.applyUpdate();
      if (!success) {
        // Fallback to force refresh
        setTimeout(() => {
          pwaUpdateManager.forceRefresh();
        }, 1000);
      }
    } catch (err) {
      console.error('PWA Update: Failed to apply update:', err);
      setIsUpdating(false);
      error('Update mislukt. Probeer de pagina handmatig te vernieuwen.', 5000);
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    try {
      const result = await deferredPrompt.prompt();
      console.log('PWA Install: User choice:', result.outcome);
      
      if (result.outcome === 'accepted') {
        info('📱 App wordt geïnstalleerd...', 2000);
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (err) {
      console.error('PWA Install: Install failed:', err);
      error('Installatie mislukt. Probeer het later opnieuw.', 3000);
    }
  };

  const dismissUpdate = () => {
    setUpdateAvailable(false);
  };

  const dismissInstall = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Update Available Notification */}
      <AnimatePresence>
        {updateAvailable && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 safe-area-all"
          >
            <div className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border-color))]/20 rounded-2xl shadow-2xl p-4 backdrop-blur-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[rgb(var(--card-text))] mb-1">
                    🚀 Nieuwe versie beschikbaar!
                  </h3>
                  <p className="text-xs text-[rgb(var(--text-color))]/70 mb-3">
                    Er is een update beschikbaar met nieuwe functies en verbeteringen.
                  </p>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg text-xs font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Bijwerken...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3" />
                          <span>Nu bijwerken</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={dismissUpdate}
                      className="px-3 py-1.5 text-[rgb(var(--text-color))]/60 hover:text-[rgb(var(--card-text))] rounded-lg text-xs font-medium transition-colors duration-200"
                    >
                      Later
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={dismissUpdate}
                  className="flex-shrink-0 p-1 text-[rgb(var(--text-color))]/40 hover:text-[rgb(var(--card-text))] rounded-lg transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install App Notification */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50 safe-area-all"
          >
            <div className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border-color))]/20 rounded-2xl shadow-2xl p-4 backdrop-blur-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[rgb(var(--card-text))] mb-1">
                    📱 Installeer de app
                  </h3>
                  <p className="text-xs text-[rgb(var(--text-color))]/70 mb-3">
                    Installeer de app op je apparaat voor snellere toegang en offline gebruik.
                  </p>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleInstallApp}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-lg text-xs font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Installeren</span>
                    </button>
                    
                    <button
                      onClick={dismissInstall}
                      className="px-3 py-1.5 text-[rgb(var(--text-color))]/60 hover:text-[rgb(var(--card-text))] rounded-lg text-xs font-medium transition-colors duration-200"
                    >
                      Niet nu
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={dismissInstall}
                  className="flex-shrink-0 p-1 text-[rgb(var(--text-color))]/40 hover:text-[rgb(var(--card-text))] rounded-lg transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PWAUpdateNotification;