import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Link2, BarChart3, Settings } from 'lucide-react';
import { getDeviceInfo } from '../utils/deviceUID';

const SettingsPage = ({ lists = [], onBack, onNavigateToAnalytics }) => {
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
            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg">
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
                  className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <BarChart3 className="w-5 h-5 mr-3" />
                  <span className="font-medium">Open Analytics Dashboard</span>
                </button>
              </div>
              
              {lists.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{lists.length}</div>
                    <div className="text-xs text-[rgb(var(--text-color))]/60">Totaal lijsten</div>
                  </div>
                  <div className="bg-secondary/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-secondary">
                      {lists.filter(list => list.isCreator).length}
                    </div>
                    <div className="text-xs text-[rgb(var(--text-color))]/60">Eigenaar van</div>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-accent">
                      {lists.filter(list => !list.isCreator).length}
                    </div>
                    <div className="text-xs text-[rgb(var(--text-color))]/60">Gedeeld met jou</div>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {lists.reduce((sum, list) => sum + (list.items || []).length, 0)}
                    </div>
                    <div className="text-xs text-[rgb(var(--text-color))]/60">Totaal items</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

    </div>
  );
};

export default SettingsPage;