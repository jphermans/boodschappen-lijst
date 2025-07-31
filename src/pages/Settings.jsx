import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Link2, BarChart3, Settings, RotateCcw, Download, RefreshCw, Copy, User, Database, Shield, Package, CheckCircle, AlertCircle, Info, Code, Github, ExternalLink, Heart } from 'lucide-react';
import { getDeviceInfo } from '../utils/deviceUID';
import { getCurrentUserID } from '../firebase';
import { useToast } from '../context/ToastContext';
import pwaUpdateManager from '../utils/pwaUpdateManager';

const SettingsPage = ({ lists = [], onBack, onNavigateToAnalytics, onNavigateToTheme, onNavigateToPersistence }) => {
  const deviceInfo = getDeviceInfo();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [versionDetails, setVersionDetails] = useState({
    current: '',
    latest: '',
    updateAvailable: false
  });
  const [currentUserID, setCurrentUserID] = useState('');
  const { success, error, info } = useToast();

  useEffect(() => {
    // Get app version details
    const getVersionInfo = async () => {
      try {
        const details = await pwaUpdateManager.getVersionDetails();
        setVersionDetails(details);
      } catch (err) {
        console.log('Could not get version info:', err);
        // Fallback to basic version info
        try {
          const version = await pwaUpdateManager.getVersionInfo();
          setVersionDetails({
            current: version || '1.0.0',
            latest: version || '1.0.0',
            updateAvailable: false
          });
        } catch (fallbackErr) {
          console.log('Fallback version fetch failed:', fallbackErr);
        }
      }
    };
    
    // Get current user ID
    const userID = getCurrentUserID();
    if (userID) {
      setCurrentUserID(userID);
    }
    
    getVersionInfo();
  }, []);

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      success(`${label} gekopieerd naar klembord!`, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      success(`${label} gekopieerd naar klembord!`, 2000);
    }
  };

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdate(true);
    info('🔍 Controleren op updates...', 2000);
    
    try {
      const updateFound = await pwaUpdateManager.checkForUpdates();
      
      // Refresh version details after check
      const details = await pwaUpdateManager.getVersionDetails();
      setVersionDetails(details);
      
      setTimeout(() => {
        if (pwaUpdateManager.updateAvailable || details.updateAvailable) {
          success('🚀 Nieuwe versie gevonden! Update notificatie wordt getoond.', 4000);
        } else {
          info('✅ Je gebruikt al de nieuwste versie!', 3000);
        }
        setIsCheckingUpdate(false);
      }, 1500);
    } catch (err) {
      console.error('Update check failed:', err);
      error('❌ Kon niet controleren op updates. Controleer je internetverbinding.', 4000);
      setIsCheckingUpdate(false);
    }
  };

  const handleForceRefresh = () => {
    info('🔄 App wordt geforceerd vernieuwd...', 2000);
    setTimeout(() => {
      pwaUpdateManager.forceRefresh();
    }, 1000);
  };

  const handleForceClearAll = async () => {
    if (window.confirm('Dit zal alle caches, service workers en lokale data wissen. De app wordt volledig herstart. Doorgaan?')) {
      info('🧹 Alles wordt gewist en app herstart...', 3000);
      setTimeout(() => {
        pwaUpdateManager.forceClearAll();
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen-safe bg-[rgb(var(--bg-color))] transition-colors duration-300">
      {/* Safe area background extension */}
      <div className="fixed inset-x-0 top-0 h-[var(--safe-area-inset-top)] bg-[rgb(var(--card-bg))] z-50"></div>
      
      {/* Header */}
      <header className="fixed-top-safe bg-[rgb(var(--card-bg))] shadow-sm border-b border-[rgb(var(--border-color))]/20 header-safe-area">
        <div className="max-w-[1920px] mx-auto px-4 lg:px-8 xl:px-12 safe-area-x">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Back Button and Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--border-color))]/30 text-[rgb(var(--card-text))] transition-all duration-200 group"
                aria-label="Terug naar overzicht"
              >
                <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6 group-hover:-translate-x-1 transition-transform duration-200" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-[rgb(var(--card-text))] tracking-tight">
                  Instellingen
                </h1>
                <p className="hidden lg:block text-sm text-[rgb(var(--text-color))]/60 font-medium">
                  Pas je voorkeuren aan
                </p>
              </div>
            </div>

            {/* Settings Icon */}
            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-[rgb(var(--primary-color))] rounded-xl shadow-lg">
              <Settings className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 lg:px-8 xl:px-12 py-6 lg:py-8 xl:py-12 safe-area-x content-safe-area" style={{ paddingTop: 'calc(var(--header-height) + 1.5rem)' }}>
        <div className="space-y-8">
          
          {/* App Version Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
              <Package className="w-6 h-6 mr-3 text-[rgb(var(--primary-color))]" />
              App Versie
            </h2>
            
            <div className="space-y-4">
              {/* Current Version */}
              <div className="bg-[rgb(var(--primary-color))]/10 border border-[rgb(var(--primary-color))]/20 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[rgb(var(--primary-color))] flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Huidige Versie
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-[rgb(var(--text-color))]/60">Actief</span>
                  </div>
                </div>
                <div className="bg-[rgb(var(--card-bg))] p-3 rounded border">
                  <p className="text-lg font-mono font-bold text-[rgb(var(--primary-color))]">
                    v{versionDetails.current || 'Laden...'}
                  </p>
                </div>
              </div>

              {/* Latest Version & Update Status */}
              <div className={`p-4 rounded-lg border ${
                versionDetails.updateAvailable
                  ? 'bg-[rgb(var(--warning-color))]/10 border-[rgb(var(--warning-color))]/20'
                  : 'bg-[rgb(var(--success-color))]/10 border-[rgb(var(--success-color))]/20'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-lg font-semibold flex items-center ${
                    versionDetails.updateAvailable
                      ? 'text-[rgb(var(--warning-color))]'
                      : 'text-[rgb(var(--success-color))]'
                  }`}>
                    {versionDetails.updateAvailable ? (
                      <AlertCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    )}
                    {versionDetails.updateAvailable ? 'Update Beschikbaar' : 'Up-to-date'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      versionDetails.updateAvailable ? 'bg-orange-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-sm text-[rgb(var(--text-color))]/60">
                      {versionDetails.updateAvailable ? 'Update vereist' : 'Nieuwste versie'}
                    </span>
                  </div>
                </div>
                <div className="bg-[rgb(var(--card-bg))] p-3 rounded border">
                  <p className={`text-lg font-mono font-bold ${
                    versionDetails.updateAvailable
                      ? 'text-[rgb(var(--warning-color))]'
                      : 'text-[rgb(var(--success-color))]'
                  }`}>
                    v{versionDetails.latest || versionDetails.current || 'Laden...'}
                  </p>
                </div>
                {versionDetails.updateAvailable && (
                  <div className="mt-3 p-3 bg-[rgb(var(--warning-color))]/5 rounded border border-[rgb(var(--warning-color))]/10">
                    <p className="text-sm text-[rgb(var(--warning-color))] flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Een nieuwe versie is beschikbaar! Gebruik de update knoppen hieronder.
                    </p>
                  </div>
                )}
              </div>

              {/* Version Comparison */}
              {versionDetails.current && versionDetails.latest && versionDetails.current !== versionDetails.latest && (
                <div className="bg-[rgb(var(--info-color))]/10 border border-[rgb(var(--info-color))]/20 p-4 rounded-lg">
                  <h4 className="text-base font-semibold text-[rgb(var(--info-color))] mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Versie Vergelijking
                  </h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[rgb(var(--text-color))]/70">
                      v{versionDetails.current} → v{versionDetails.latest}
                    </span>
                    <span className="px-2 py-1 bg-[rgb(var(--info-color))]/20 text-[rgb(var(--info-color))] rounded text-xs font-medium">
                      Update Aanbevolen
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          {/* User Identity & Sharing Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
              <User className="w-6 h-6 mr-3 text-[rgb(var(--primary-color))]" />
              Gebruiker Identiteit
            </h2>
            
            <div className="space-y-6">
              {/* Complete User ID Display */}
              <div className="bg-[rgb(var(--primary-color))]/10 border border-[rgb(var(--primary-color))]/20 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-[rgb(var(--primary-color))] flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Firebase Gebruiker ID
                  </h3>
                  <button
                    onClick={() => copyToClipboard(currentUserID, 'Gebruiker ID')}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-[rgb(var(--primary-color))]/20 hover:bg-[rgb(var(--primary-color))]/30 text-[rgb(var(--primary-color))] rounded-lg transition-colors text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Kopiëren</span>
                  </button>
                </div>
                <div className="bg-[rgb(var(--card-bg))] p-3 rounded border">
                  <p className="text-sm font-mono text-[rgb(var(--card-text))] break-all">
                    {currentUserID || 'Laden...'}
                  </p>
                </div>
                <p className="text-xs text-[rgb(var(--text-color))]/60 mt-2">
                  Dit is je unieke Firebase authenticatie ID die automatisch wordt gegenereerd
                </p>
              </div>

              {/* Legacy Device ID */}
              <div className="bg-[rgb(var(--border-color))]/10 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-[rgb(var(--card-text))]">
                    Legacy Device ID
                  </h3>
                  <button
                    onClick={() => copyToClipboard(deviceInfo.deviceId, 'Device ID')}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--border-color))]/30 text-[rgb(var(--card-text))] rounded-lg transition-colors text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Kopiëren</span>
                  </button>
                </div>
                <div className="bg-[rgb(var(--card-bg))] p-3 rounded border">
                  <p className="text-sm font-mono text-[rgb(var(--card-text))] break-all">
                    {deviceInfo.deviceId}
                  </p>
                </div>
                <p className="text-xs text-[rgb(var(--text-color))]/60 mt-2">
                  Lokaal gegenereerd apparaat ID (gebruikt voor backward compatibility)
                </p>
              </div>

              {/* Where User ID is Used */}
              <div className="bg-[rgb(var(--info-color))]/10 border border-[rgb(var(--info-color))]/20 p-4 rounded-lg">
                <h3 className="text-base font-semibold text-[rgb(var(--info-color))] mb-3 flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Waar wordt je User ID gebruikt?
                </h3>
                <div className="space-y-3 text-sm text-[rgb(var(--text-color))]/80">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[rgb(var(--success-color))] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Lijst Eigenaarschap</p>
                      <p className="text-xs text-[rgb(var(--text-color))]/60">Als <code className="bg-[rgb(var(--border-color))]/20 px-1 rounded">creatorId</code> en <code className="bg-[rgb(var(--border-color))]/20 px-1 rounded">deviceUID</code> in Firebase</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[rgb(var(--success-color))] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Lijst Delen</p>
                      <p className="text-xs text-[rgb(var(--text-color))]/60">Toegevoegd aan <code className="bg-[rgb(var(--border-color))]/20 px-1 rounded">sharedWith</code> array bij delen</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[rgb(var(--success-color))] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Item Tracking</p>
                      <p className="text-xs text-[rgb(var(--text-color))]/60">Als <code className="bg-[rgb(var(--border-color))]/20 px-1 rounded">addedBy</code> bij nieuwe items</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[rgb(var(--success-color))] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Toegangscontrole</p>
                      <p className="text-xs text-[rgb(var(--text-color))]/60">Firebase Security Rules controleren toegang op basis van dit ID</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[rgb(var(--success-color))] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">QR Code Delen</p>
                      <p className="text-xs text-[rgb(var(--text-color))]/60">Gebruikt voor automatische toegang bij scannen</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sharing Instructions */}
              <div className="bg-[rgb(var(--secondary-color))]/10 border border-[rgb(var(--secondary-color))]/20 p-4 rounded-lg">
                <h3 className="text-base font-semibold text-[rgb(var(--secondary-color))] mb-3 flex items-center">
                  <Link2 className="w-5 h-5 mr-2" />
                  Hoe lijsten delen werkt
                </h3>
                <div className="space-y-2 text-sm text-[rgb(var(--text-color))]/70">
                  <p>1. Klik op "Delen" bij een lijst die je hebt gemaakt</p>
                  <p>2. Deel de QR-code of link met anderen</p>
                  <p>3. Anderen scannen de QR-code of openen de link</p>
                  <p>4. Hun User ID wordt automatisch toegevoegd aan de lijst</p>
                  <p>5. De lijst verschijnt in hun overzicht met "Gedeeld" badge</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Analytics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-[rgb(var(--accent-color))]" />
              Analytics & Statistieken
            </h2>
            
            <div className="space-y-4">
              <div className="bg-[rgb(var(--border-color))]/10 p-4 rounded-lg">
                <p className="text-sm text-[rgb(var(--text-color))]/80 mb-4">
                  Bekijk gedetailleerde statistieken over je lijsten, delen-activiteit en gebruikspatronen.
                </p>
                
                <button
                  onClick={onNavigateToAnalytics}
                  className="w-full flex items-center justify-center px-6 py-4 bg-[rgb(var(--color-primary-button))] hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  <span className="font-medium">Open Analytics Dashboard</span>
                </button>
              </div>
              
              {lists.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[rgb(var(--primary-color))]/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-[rgb(var(--primary-color))]">{lists.length}</div>
                    <div className="text-xs text-[rgb(var(--text-color))]/60">Totaal lijsten</div>
                  </div>
                  <div className="bg-[rgb(var(--secondary-color))]/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-[rgb(var(--secondary-color))]">
                      {lists.filter(list => list.isCreator).length}
                    </div>
                    <div className="text-xs text-[rgb(var(--text-color))]/60">Eigenaar van</div>
                  </div>
                  <div className="bg-[rgb(var(--accent-color))]/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-[rgb(var(--accent-color))]">
                      {lists.filter(list => !list.isCreator).length}
                    </div>
                    <div className="text-xs text-[rgb(var(--text-color))]/60">Gedeeld met jou</div>
                  </div>
                  <div className="bg-[rgb(var(--success-color))]/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-[rgb(var(--success-color))]">
                      {lists.reduce((sum, list) => sum + (list.items || []).length, 0)}
                    </div>
                    <div className="text-xs text-[rgb(var(--text-color))]/60">Totaal items</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Theme Settings Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
              <div className="w-6 h-6 mr-3 bg-[rgb(var(--accent-color))] rounded-lg"></div>
              Thema Instellingen
            </h2>
            
            <div className="space-y-4">
              <div className="bg-[rgb(var(--border-color))]/10 p-4 rounded-lg">
                <p className="text-sm text-[rgb(var(--text-color))]/80 mb-4">
                  Pas het uiterlijk van de app aan naar jouw voorkeur. Kies tussen licht en donker thema, of pas de kleuren aan.
                </p>
                
                <button
                  onClick={onNavigateToTheme}
                  className="w-full flex items-center justify-center px-6 py-4 bg-[rgb(var(--color-accent-button))] hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <span className="font-medium">Thema Aanpassen</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* App Update Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.175 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <RotateCcw className="w-4 h-4 text-white" />
              </div>
              App Updates
            </h2>

            <div className="space-y-4">
              <div className="bg-[rgb(var(--border-color))]/10 p-4 rounded-lg">
                <p className="text-sm text-[rgb(var(--text-color))]/80 mb-4">
                  Houd je app up-to-date voor de nieuwste functies en verbeteringen. Updates worden automatisch gedetecteerd op basis van versienummers.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={handleCheckForUpdates}
                    disabled={isCheckingUpdate}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 ${
                      versionDetails.updateAvailable
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                    }`}
                  >
                    {isCheckingUpdate ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="font-medium">Controleren...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span className="font-medium">
                          {versionDetails.updateAvailable ? 'Update Beschikbaar!' : 'Check Updates'}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleForceRefresh}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--border-color))]/30 text-[rgb(var(--card-text))] rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="font-medium">Force Refresh</span>
                  </button>

                  <button
                    onClick={handleForceClearAll}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="font-medium">Reset All</span>
                  </button>
                </div>

                <div className="text-xs text-[rgb(var(--text-color))]/50 bg-[rgb(var(--border-color))]/5 p-3 rounded-lg mt-4">
                  <p className="mb-1"><strong>Check Updates:</strong> Controleert op nieuwe versies via versienummer vergelijking</p>
                  <p className="mb-1"><strong>Force Refresh:</strong> Vernieuwt de app volledig en wist alle caches (gebruik bij problemen)</p>
                  <p><strong>Reset All:</strong> Wist alles (service worker, caches, data) en herstart volledig - gebruik alleen bij ernstige problemen</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Data & Backup Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
              <div className="w-6 h-6 mr-3 bg-[rgb(var(--info-color))] rounded-lg"></div>
              Data & Backup
            </h2>
            
            <div className="space-y-4">
              <div className="bg-[rgb(var(--border-color))]/10 p-4 rounded-lg">
                <p className="text-sm text-[rgb(var(--text-color))]/80 mb-4">
                  Beheer je data, maak back-ups en configureer geavanceerde instellingen voor data-behoud.
                </p>
                
                <button
                  onClick={onNavigateToPersistence}
                  className="w-full flex items-center justify-center px-6 py-4 bg-[rgb(var(--color-info-button))] hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-3"
                >
                  <span className="font-medium">Data Beheren</span>
                </button>
              </div>

              <div className="bg-[rgb(var(--error-color))]/10 border border-[rgb(var(--error-color))]/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-[rgb(var(--error-color))] mb-2">Problemen oplossen</h3>
                <p className="text-sm text-[rgb(var(--text-color))]/70 mb-4">
                  Als je een leeg scherm of laadproblemen ervaart, kun je de lokale opslag wissen om de app te resetten.
                </p>
                
                <button
                  onClick={async () => {
                    if (window.confirm('Weet je zeker dat je alle lokale gegevens wilt wissen? Dit zal de app herstarten.')) {
                      try {
                        // Clear all storage mechanisms
                        localStorage.clear();
                        sessionStorage.clear();
                        
                        // Clear indexedDB if available
                        if ('indexedDB' in window) {
                          indexedDB.deleteDatabase('BoodschappenlijstDB').catch(console.warn);
                        }
                        
                        // Clear cookies
                        document.cookie.split(';').forEach(cookie => {
                          const eqPos = cookie.indexOf('=');
                          const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
                          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
                        });
                        
                        // Force reload to clear any cached state
                        window.location.href = window.location.origin + window.location.pathname;
                      } catch (e) {
                        console.warn('Error during storage cleanup:', e);
                        window.location.reload();
                      }
                    }
                  }}
                  className="w-full flex items-center justify-center px-6 py-4 bg-[rgb(var(--color-error-button))] hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <span className="font-medium">Opslag wissen & Herstarten</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Developer & Source Code Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
              <Code className="w-6 h-6 mr-3 text-[rgb(var(--secondary-color))]" />
              Ontwikkelaar & Broncode
            </h2>
            
            <div className="space-y-6">
              {/* Developer Info */}
              <div className="bg-[rgb(var(--secondary-color))]/10 border border-[rgb(var(--secondary-color))]/20 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Heart className="w-5 h-5 mr-2 text-[rgb(var(--secondary-color))]" />
                  <h3 className="text-lg font-semibold text-[rgb(var(--secondary-color))]">
                    Gemaakt met ❤️ door
                  </h3>
                </div>
                <div className="bg-[rgb(var(--card-bg))] p-3 rounded border">
                  <p className="text-base font-medium text-[rgb(var(--card-text))]">
                    Jan-Pieter Hermans
                  </p>
                  <p className="text-sm text-[rgb(var(--text-color))]/60 mt-1">
                    Full-Stack Developer & PWA Specialist
                  </p>
                </div>
              </div>

              {/* GitHub Links */}
              <div className="bg-[rgb(var(--primary-color))]/10 border border-[rgb(var(--primary-color))]/20 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <Github className="w-5 h-5 mr-2 text-[rgb(var(--primary-color))]" />
                  <h3 className="text-lg font-semibold text-[rgb(var(--primary-color))]">
                    Open Source Project
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {/* Source Code Repository */}
                  <div className="bg-[rgb(var(--card-bg))] p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--card-text))]">Broncode Repository</p>
                        <p className="text-xs text-[rgb(var(--text-color))]/60">Bekijk en draag bij aan de code</p>
                      </div>
                      <a
                        href="https://github.com/jphermans/boodschappenlijst"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-3 py-2 bg-[rgb(var(--primary-color))]/20 hover:bg-[rgb(var(--primary-color))]/30 text-[rgb(var(--primary-color))] rounded-lg transition-colors text-sm"
                      >
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Live Deployment */}
                  <div className="bg-[rgb(var(--card-bg))] p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--card-text))]">Live Deployment</p>
                        <p className="text-xs text-[rgb(var(--text-color))]/60">GitHub Pages hosting</p>
                      </div>
                      <a
                        href="https://jphermans.github.io/boodschappenlijst/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-3 py-2 bg-[rgb(var(--success-color))]/20 hover:bg-[rgb(var(--success-color))]/30 text-[rgb(var(--success-color))] rounded-lg transition-colors text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Live App</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="bg-[rgb(var(--info-color))]/10 border border-[rgb(var(--info-color))]/20 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Info className="w-5 h-5 mr-2 text-[rgb(var(--info-color))]" />
                  <h3 className="text-base font-semibold text-[rgb(var(--info-color))]">
                    Project Informatie
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-[rgb(var(--text-color))]/80">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[rgb(var(--info-color))] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Progressive Web App (PWA)</p>
                      <p className="text-xs text-[rgb(var(--text-color))]/60">Installeerbaar op alle apparaten</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[rgb(var(--info-color))] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">React + Firebase</p>
                      <p className="text-xs text-[rgb(var(--text-color))]/60">Moderne tech stack met real-time sync</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[rgb(var(--info-color))] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Open Source</p>
                      <p className="text-xs text-[rgb(var(--text-color))]/60">MIT License - vrij te gebruiken en aan te passen</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-[rgb(var(--info-color))] rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Offline Support</p>
                      <p className="text-xs text-[rgb(var(--text-color))]/60">Werkt ook zonder internetverbinding</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contribution Info */}
              <div className="bg-[rgb(var(--accent-color))]/10 border border-[rgb(var(--accent-color))]/20 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Heart className="w-5 h-5 mr-2 text-[rgb(var(--accent-color))]" />
                  <h3 className="text-base font-semibold text-[rgb(var(--accent-color))]">
                    Bijdragen Welkom
                  </h3>
                </div>
                <p className="text-sm text-[rgb(var(--text-color))]/70 mb-3">
                  Dit is een open source project! Voel je vrij om bij te dragen via GitHub:
                </p>
                <div className="space-y-2 text-xs text-[rgb(var(--text-color))]/60">
                  <p>• 🐛 Bug reports en feature requests</p>
                  <p>• 🔧 Code contributions en pull requests</p>
                  <p>• 📖 Documentatie verbeteringen</p>
                  <p>• 🌍 Vertalingen naar andere talen</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

    </div>
  );
};

export default SettingsPage;