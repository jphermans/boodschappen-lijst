// Component for monitoring and managing persistence health
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  RefreshCw, 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Info,
  Settings,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useStateHealth, useStateBackup } from '../hooks/usePersistentState';

const PersistenceHealthMonitor = ({ onClose }) => {
  const { healthInfo, refreshHealthInfo, isLoading } = useStateHealth();
  const { createBackup, restoreFromFile, isCreatingBackup, isRestoring, error } = useStateBackup();
  const [showDetails, setShowDetails] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await restoreFromFile(file);
      } catch (err) {
        console.error('Restore failed:', err);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      try {
        await restoreFromFile(files[0]);
      } catch (err) {
        console.error('Restore failed:', err);
      }
    }
  };

  const getStorageStatusIcon = (available) => {
    if (available) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStorageStatusColor = (available) => {
    return available ? 'text-green-600' : 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[rgb(var(--card-bg))] rounded-2xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-primary mr-3" />
            <span className="text-[rgb(var(--card-text))]">Laden van persistentie informatie...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-2xl max-w-2xl w-full my-8 flex flex-col max-h-[calc(100vh-4rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--border-color))]/20 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[rgb(var(--card-text))]">
                Persistentie Monitor
              </h2>
              <p className="text-sm text-[rgb(var(--text-color))]/60">
                iOS Safari & Cross-platform opslag status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-[rgb(var(--border-color))]/20 hover:bg-[rgb(var(--border-color))]/30 flex items-center justify-center transition-colors z-10 touch-manipulation"
          >
            <XCircle className="w-6 h-6 text-[rgb(var(--text-color))]/60" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto flex-1 overscroll-contain">
          {/* Storage Health Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--card-text))] mb-4 flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              Opslag Mechanismen
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthInfo?.storageHealth?.available && Object.entries(healthInfo.storageHealth.available).map(([storage, available]) => (
                <div
                  key={storage}
                  className={`p-4 rounded-xl border-2 ${
                    available 
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStorageStatusIcon(available)}
                      <span className="font-medium text-[rgb(var(--card-text))]">
                        {storage === 'localStorage' && 'Local Storage'}
                        {storage === 'sessionStorage' && 'Session Storage'}
                        {storage === 'indexedDB' && 'IndexedDB'}
                        {storage === 'cookieStorage' && 'Cookie Storage'}
                        {storage === 'memoryStorage' && 'Memory Cache'}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${getStorageStatusColor(available)}`}>
                      {available ? 'Beschikbaar' : 'Niet beschikbaar'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User State Info */}
          {healthInfo?.userInfo && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[rgb(var(--card-text))] mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Gebruiker Status
              </h3>
              
              <div className="bg-[rgb(var(--border-color))]/10 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-[rgb(var(--text-color))]/60">Naam</span>
                    <p className="font-medium text-[rgb(var(--card-text))]">
                      {healthInfo.userInfo.name || 'Niet ingesteld'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-[rgb(var(--text-color))]/60">Status</span>
                    <p className="font-medium text-[rgb(var(--card-text))]">
                      {healthInfo.userInfo.hasName ? 'Actief' : 'Inactief'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-[rgb(var(--text-color))]/60">Sessie ID</span>
                    <p className="font-mono text-xs text-[rgb(var(--card-text))]">
                      {healthInfo.userInfo.session?.sessionId?.slice(-8) || 'Geen'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-[rgb(var(--text-color))]/60">Laatste activiteit</span>
                    <p className="text-sm text-[rgb(var(--card-text))]">
                      {healthInfo.userInfo.session?.lastActivity 
                        ? new Date(healthInfo.userInfo.session.lastActivity).toLocaleTimeString('nl-NL')
                        : 'Onbekend'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* State Statistics */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--card-text))] mb-4 flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Status Statistieken
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-[rgb(var(--border-color))]/10 rounded-xl">
                <div className="text-2xl font-bold text-primary">
                  {healthInfo?.state?.lists?.length || 0}
                </div>
                <div className="text-sm text-[rgb(var(--text-color))]/60">Lijsten</div>
              </div>
              
              <div className="text-center p-4 bg-[rgb(var(--border-color))]/10 rounded-xl">
                <div className="text-2xl font-bold text-secondary">
                  {healthInfo?.syncQueue || 0}
                </div>
                <div className="text-sm text-[rgb(var(--text-color))]/60">Sync Queue</div>
              </div>
              
              <div className="text-center p-4 bg-[rgb(var(--border-color))]/10 rounded-xl">
                <div className="text-2xl font-bold text-accent">
                  {healthInfo?.storageHealth?.memoryCache || 0}
                </div>
                <div className="text-sm text-[rgb(var(--text-color))]/60">Memory Cache</div>
              </div>
              
              <div className="text-center p-4 bg-[rgb(var(--border-color))]/10 rounded-xl">
                <div className="text-2xl font-bold text-[rgb(var(--card-text))]">
                  {healthInfo?.subscribers?.length || 0}
                </div>
                <div className="text-sm text-[rgb(var(--text-color))]/60">Subscribers</div>
              </div>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[rgb(var(--card-text))] mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Backup & Herstel
            </h3>
            
            <div className="space-y-4">
              {/* Create Backup */}
              <button
                onClick={createBackup}
                disabled={isCreatingBackup}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 font-semibold"
              >
                {isCreatingBackup ? (
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Download className="w-5 h-5 mr-2" />
                )}
                {isCreatingBackup ? 'Backup maken...' : 'Download Backup'}
              </button>

              {/* Restore from File */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  dragOver 
                    ? 'border-primary bg-primary/10' 
                    : 'border-[rgb(var(--border-color))]/40 hover:border-[rgb(var(--border-color))]/60'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 text-[rgb(var(--text-color))]/40 mx-auto mb-2" />
                <p className="text-[rgb(var(--text-color))]/60 mb-2">
                  Sleep backup bestand hierheen of
                </p>
                <label className="inline-flex items-center px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  Selecteer Bestand
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {isRestoring && (
                  <div className="mt-2 flex items-center justify-center text-primary">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    <span>Herstellen...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <span className="font-medium text-red-700 dark:text-red-300">Fout</span>
              </div>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {error.message || 'Er is een onbekende fout opgetreden'}
              </p>
            </div>
          )}

          {/* Detailed Info Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-center px-4 py-2 text-[rgb(var(--text-color))]/60 hover:text-[rgb(var(--card-text))] transition-colors"
          >
            <Info className="w-4 h-4 mr-2" />
            {showDetails ? 'Verberg details' : 'Toon details'}
          </button>

          {/* Detailed Information */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-[rgb(var(--border-color))]/10 rounded-xl"
              >
                <pre className="text-xs text-[rgb(var(--text-color))]/80 overflow-auto">
                  {JSON.stringify(healthInfo, null, 2)}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[rgb(var(--border-color))]/20 flex-shrink-0">
          <div className="text-sm text-[rgb(var(--text-color))]/60">
            Laatste sync: {healthInfo?.lastSyncTime
              ? new Date(healthInfo.lastSyncTime).toLocaleTimeString('nl-NL')
              : 'Nooit'
            }
          </div>
          <button
            onClick={refreshHealthInfo}
            disabled={isLoading}
            className="flex items-center px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Vernieuwen
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PersistenceHealthMonitor;