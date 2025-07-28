import React from 'react';
import { motion } from 'framer-motion';
import { WifiOff, AlertTriangle } from 'lucide-react';

const ConnectionError = ({ error, onRetry }) => {
  const getErrorMessage = () => {
    switch (error?.message) {
      case 'Firebase configuratie ontbreekt':
        return {
          title: 'Firebase configuratie ontbreekt',
          description: 'De Firebase configuratie is niet ingesteld. Controleer je environment variables.',
          action: 'Configureer Firebase'
        };
      case 'Network Error':
      case 'Failed to fetch':
        return {
          title: 'Geen internetverbinding',
          description: 'Controleer je internetverbinding en probeer het opnieuw.',
          action: 'Probeer opnieuw'
        };
      default:
        return {
          title: 'Verbindingsprobleem',
          description: error?.message || 'Er is een probleem met de verbinding naar de server.',
          action: 'Probeer opnieuw'
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex items-center justify-center p-4 bg-[rgb(var(--bg-color))]"
    >
      <div className="max-w-md w-full bg-[rgb(var(--card-bg))] rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          {error?.message === 'Firebase configuratie ontbreekt' ? (
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          ) : (
            <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-[rgb(var(--text-color))] mb-4"
        >
          {errorInfo.title}
        </h2>

        <p className="text-[rgb(var(--text-color))]/80 mb-6"
        >
          {errorInfo.description}
        </p>

        <div className="space-y-4">
          <button
            onClick={onRetry}
            className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {errorInfo.action}
          </button>

          {error?.message === 'Firebase configuratie ontbreekt' && (
            <div className="text-sm text-[rgb(var(--text-color))]/60 text-left"
            >
              <p className="mb-2"><strong>Vereiste environment variables:</strong></p>
              <pre className="bg-[rgb(var(--border-color))]/20 p-3 rounded text-xs overflow-x-auto"
              >
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
              </pre>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[rgb(var(--border-color))]/50"
        >
          <p className="text-xs text-[rgb(var(--text-color))]/60"
          >
            De app werkt momenteel offline. Je kunt nog steeds lijsten maken en bewerken, 
            maar de gegevens worden niet opgeslagen.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ConnectionError;