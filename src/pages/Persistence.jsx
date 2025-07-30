import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Database, RefreshCw, Download, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useStateHealth, useStateBackup } from '../hooks/usePersistentState';

const PersistencePage = ({ onBack }) => {
  const { healthInfo, refreshHealthInfo, isLoading } = useStateHealth();
  const { createBackup, restoreFromFile, isCreatingBackup: hookCreatingBackup, isRestoring: hookRestoring, error } = useStateBackup();
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [fileInputRef, setFileInputRef] = useState(null);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Nooit';
    return new Date(timestamp).toLocaleString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true);
      await createBackup();
    } catch (error) {
      console.error('Backup creation failed:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsRestoring(true);
      console.log('🔄 Starting restore process...');
      const success = await restoreFromFile(file);
      if (success) {
        console.log('✅ Restore completed successfully');
        alert('✅ Backup hersteld! Controleer je boodschappenlijsten om de wijzigingen te zien.');
        // Force refresh of health info to show updated state
        await refreshHealthInfo();
      } else {
        console.error('❌ Restore failed without throwing error');
        alert('❌ Herstellen mislukt. Controleer het bestand en probeer opnieuw.');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert(`❌ Fout bij herstellen: ${error.message || 'Onbekende fout'}`);
    } finally {
      setIsRestoring(false);
      event.target.value = '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 lg:px-8 py-8"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 lg:px-8 py-8"
    >
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 bg-[rgb(var(--card-bg))] rounded-lg hover:bg-[rgb(var(--border-color))]/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Terug</span>
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-2xl lg:text-3xl font-bold text-[rgb(var(--card-text))]">
            Persistentie Status
          </h1>
          <p className="text-[rgb(var(--text-color))]/60 mt-2">
            Beheer en controleer je opgeslagen gegevens
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Storage Health */}
        <div className="bg-[rgb(var(--card-bg))] rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Opslag Status</h3>
            {getStatusIcon(healthInfo?.storageHealth?.status)}
          </div>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(healthInfo?.storageHealth?.status)}`}>
            {healthInfo?.storageHealth?.status || 'Onbekend'}
          </div>
          <p className="text-sm text-[rgb(var(--text-color))]/60 mt-2">
            Laatste check: {formatDate(healthInfo?.storageHealth?.lastCheck)}
          </p>
        </div>

        {/* Data Size */}
        <div className="bg-[rgb(var(--card-bg))] rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Gegevensgrootte</h3>
            <Database className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--card-text))]">
            {formatBytes(healthInfo?.storageHealth?.totalSize || 0)}
          </p>
          <p className="text-sm text-[rgb(var(--text-color))]/60">
            {healthInfo?.storageHealth?.items || 0} items opgeslagen
          </p>
        </div>

        {/* Last Sync */}
        <div className="bg-[rgb(var(--card-bg))] rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Laatste Sync</h3>
            <Clock className="w-5 h-5 text-secondary" />
          </div>
          <p className="text-sm font-medium text-[rgb(var(--card-text))]">
            {formatDate(healthInfo?.lastSyncTime)}
          </p>
          <p className="text-sm text-[rgb(var(--text-color))]/60">
            {healthInfo?.syncQueue || 0} items in wachtrij
          </p>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Storage Details */}
        <div className="bg-[rgb(var(--card-bg))] rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Opslag Details</h3>
          <div className="space-y-3">
            {healthInfo?.state && Object.entries(healthInfo.state).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-2 border-b border-[rgb(var(--border-color))]/20">
                <span className="text-sm font-medium capitalize">{key}</span>
                <span className="text-sm text-[rgb(var(--text-color))]/60">
                  {Array.isArray(value) ? `${value.length} items` : 
                   typeof value === 'object' ? `${Object.keys(value).length} properties` : 
                   String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[rgb(var(--card-bg))] rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Acties</h3>
          <div className="space-y-4">
            <button
              onClick={refreshHealthInfo}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-primary hover:opacity-90 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Vernieuwen
            </button>

            <button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup || hookCreatingBackup}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              {isCreatingBackup || hookCreatingBackup ? 'Backup maken...' : 'Backup maken'}
            </button>

            <label className="w-full flex items-center justify-center px-4 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              {isRestoring || hookRestoring ? 'Herstellen...' : 'Herstellen'}
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isRestoring || hookRestoring}
              />
            </label>
          </div>

          <div className="mt-4 p-4 bg-[rgb(var(--border-color))]/10 rounded-lg">
            <h4 className="font-medium mb-2">💡 Tips</h4>
            <ul className="text-sm text-[rgb(var(--text-color))]/60 space-y-1">
              <li>• Maak regelmatig backups van je gegevens</li>
              <li>• Herstel alleen van betrouwbare backups</li>
              <li>• Controleer de opslagstatus bij problemen</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
          <strong className="font-bold">Fout: </strong>
          <span className="block sm:inline">{error.message || 'Er is een fout opgetreden'}</span>
        </div>
      )}

      {/* User Info */}
      {healthInfo?.userInfo && (
        <div className="mt-8 bg-[rgb(var(--card-bg))] rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Gebruikersinformatie</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-[rgb(var(--text-color))]/60">Naam:</span>
              <p className="font-medium">{healthInfo.userInfo.name || 'Niet ingesteld'}</p>
            </div>
            <div>
              <span className="text-sm text-[rgb(var(--text-color))]/60">Status:</span>
              <p className="font-medium">{healthInfo.userInfo.hasName ? 'Voltooid' : 'Incompleet'}</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PersistencePage;