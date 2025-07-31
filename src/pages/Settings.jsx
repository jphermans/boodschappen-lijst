import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Link2, BarChart3, Settings } from 'lucide-react';
import { getDeviceInfo } from '../utils/deviceUID';

const SettingsPage = ({ lists = [], onBack, onNavigateToAnalytics, onNavigateToTheme, onNavigateToPersistence }) => {
  const deviceInfo = getDeviceInfo();

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
          {/* Sharing Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-lg border border-[rgb(var(--border-color))]/20 p-6 lg:p-8"
          >
            <h2 className="text-xl lg:text-2xl font-bold text-[rgb(var(--card-text))] mb-6 flex items-center">
              <Link2 className="w-6 h-6 mr-3 text-secondary" />
              Lijsten delen
            </h2>
            
            <div className="space-y-4">
              <div className="bg-[rgb(var(--border-color))]/10 p-4 rounded-lg">
                <p className="text-sm text-[rgb(var(--text-color))]/80 mb-3 font-medium">
                  Hoe lijsten delen:
                </p>
                <div className="space-y-2 text-sm text-[rgb(var(--text-color))]/70">
                  <p>• Klik op "Delen" bij een lijst</p>
                  <p>• Deel de QR-code of link met anderen</p>
                  <p>• Anderen kunnen de QR-code scannen of de link openen</p>
                  <p>• De lijst verschijnt automatisch in hun overzicht</p>
                </div>
              </div>
              
              <div className="bg-[rgb(var(--border-color))]/10 p-4 rounded-lg">
                <p className="text-sm text-[rgb(var(--text-color))]/80 mb-2 font-medium">
                  Gebruiker ID:
                </p>
                <p className="text-sm text-[rgb(var(--text-color))]/60 font-mono bg-[rgb(var(--border-color))]/20 p-2 rounded">
                  {deviceInfo.deviceId.substring(0, 12)}...
                </p>
                <p className="text-xs text-[rgb(var(--text-color))]/60 mt-2">
                  Dit ID wordt automatisch gebruikt voor het delen van lijsten
                </p>
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
              <BarChart3 className="w-6 h-6 mr-3 text-accent" />
              Analytics & Statistieken
            </h2>
            
            <div className="space-y-4">
              <div className="bg-[rgb(var(--border-color))]/10 p-4 rounded-lg">
                <p className="text-sm text-[rgb(var(--text-color))]/80 mb-4">
                  Bekijk gedetailleerde statistieken over je lijsten, delen-activiteit en gebruikspatronen.
                </p>
                
                <button
                  onClick={onNavigateToAnalytics}
                  className="w-full flex items-center justify-center px-6 py-4 bg-[rgb(var(--primary-color))] hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
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
                  className="w-full flex items-center justify-center px-6 py-4 bg-[rgb(var(--accent-color))] hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <span className="font-medium">Thema Aanpassen</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Data & Backup Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
                  className="w-full flex items-center justify-center px-6 py-4 bg-[rgb(var(--info-color))] hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-3"
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
                  className="w-full flex items-center justify-center px-6 py-4 bg-[rgb(var(--error-color))] hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <span className="font-medium">Opslag wissen & Herstarten</span>
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

    </div>
  );
};

export default SettingsPage;