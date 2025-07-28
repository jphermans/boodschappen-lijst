import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Palette, Moon, Sun, Link2, Smartphone, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useTheme } from '../context/ThemeContext';
import { getDeviceInfo, generateLinkCode, linkToMasterDevice, unlinkFromMasterDevice, isLinkedToMaster, parseLinkCode } from '../utils/deviceUID';

const SettingsModal = ({ onClose }) => {
  const [showQR, setShowQR] = useState(false);
  const [scanCode, setScanCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  
  const {
    theme,
    toggleTheme,
    primaryColor,
    secondaryColor,
    accentColor,
    updateColor,
    resetColors,
  } = useTheme();
  
  const deviceInfo = getDeviceInfo();
  
  const handleDeviceLink = () => {
    if (isLinkedToMaster()) {
      unlinkFromMasterDevice();
      window.location.reload();
    } else {
      setShowQR(!showQR);
    }
  };
  
  const handleScanCode = () => {
    if (scanCode.trim()) {
      const masterDevice = parseLinkCode(scanCode.trim());
      if (masterDevice) {
        linkToMasterDevice(masterDevice);
        window.location.reload();
      }
    }
  };

  const presetColors = [
    { name: 'Blauw', value: '#3b82f6' },
    { name: 'Paars', value: '#8b5cf6' },
    { name: 'Roze', value: '#ec4899' },
    { name: 'Groen', value: '#10b981' },
    { name: 'Oranje', value: '#f97316' },
    { name: 'Rood', value: '#ef4444' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Cyaan', value: '#06b6d4' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[rgb(var(--card-bg))] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border-color))]/50">
          <h2 className="text-xl font-semibold text-[rgb(var(--card-text))]">
            Instellingen
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[rgb(var(--border-color))]/20 transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--text-color))]/60" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-[rgb(var(--card-text))] mb-3">
              Thema
            </h3>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center space-x-3 p-4 w-full rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="font-medium">
                {theme === 'light' ? '🌙 Donker thema' : '☀️ Licht thema'}
              </span>
            </button>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[rgb(var(--card-text))] mb-3 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Kleuren aanpassen
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-color))]/80 mb-2">
                  Primaire kleur
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateColor('primary', color.value)}
                      className={`w-full h-10 rounded-lg border-2 transition-all ${
                        primaryColor === color.value
                          ? 'border-[rgb(var(--text-color))] scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => updateColor('primary', e.target.value)}
                  className="mt-2 w-full h-10 rounded-lg cursor-pointer border border-[rgb(var(--border-color))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-color))]/80 mb-2">
                  Secundaire kleur
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateColor('secondary', color.value)}
                      className={`w-full h-10 rounded-lg border-2 transition-all ${
                        secondaryColor === color.value
                          ? 'border-[rgb(var(--text-color))] scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => updateColor('secondary', e.target.value)}
                  className="mt-2 w-full h-10 rounded-lg cursor-pointer border border-[rgb(var(--border-color))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-color))]/80 mb-2">
                  Accentkleur
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateColor('accent', color.value)}
                      className={`w-full h-10 rounded-lg border-2 transition-all ${
                        accentColor === color.value
                          ? 'border-[rgb(var(--text-color))] scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => updateColor('accent', e.target.value)}
                  className="mt-2 w-full h-10 rounded-lg cursor-pointer border border-[rgb(var(--border-color))]"
                />
              </div>
            </div>

            <button
              onClick={resetColors}
              className="w-full mt-4 flex items-center justify-center px-4 py-3 bg-[rgb(var(--border-color))]/60 hover:bg-[rgb(var(--border-color))]/80 text-[rgb(var(--card-text))] rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Palette className="w-5 h-5 mr-2" />
              <span className="font-medium">Kleuren resetten naar standaard</span>
            </button>
          </div>

          <div className="pt-4 border-t border-[rgb(var(--border-color))]/50 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-[rgb(var(--card-text))] mb-3 flex items-center">
                <Link2 className="w-5 h-5 mr-2" />
                Apparaat koppelen
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[rgb(var(--text-color))]/80">
                      Status: {deviceInfo.isMaster ? 'Hoofdapparaat' : 'Gekoppeld'}
                    </p>
                    <p className="text-xs text-[rgb(var(--text-color))]/60">
                      ID: {deviceInfo.deviceId.substring(0, 8)}...
                    </p>
                  </div>
                  <button
                    onClick={handleDeviceLink}
                    className={`flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${
                      isLinkedToMaster()
                                              ? 'bg-accent hover:opacity-90 text-white'
                      : 'bg-primary hover:opacity-90 text-white'
                    }`}
                  >
                    {isLinkedToMaster() ? (
                      <>
                        <span className="mr-1">🔗</span>
                        Ontkoppelen
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4 mr-1" />
                        Koppelen
                      </>
                    )}
                  </button>
                </div>
                
                {showQR && (
                  <div className="space-y-3 pt-3 border-t border-[rgb(var(--border-color))]/50">
                    <div>
                      <p className="text-sm text-[rgb(var(--text-color))]/80 mb-2">
                        Scan deze QR-code op een ander apparaat:
                      </p>
                      <div className="flex justify-center mb-2">
                        <div className="bg-white p-2 rounded-lg shadow">
                          <QRCode
                            value={generateLinkCode()}
                            size={150}
                            level="H"
                            bgColor="#ffffff"
                            fgColor="#000000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={scanCode}
                          onChange={(e) => setScanCode(e.target.value)}
                          placeholder="Of vul code handmatig in..."
                          className="w-full px-3 py-2 border border-[rgb(var(--border-color))] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))] text-sm"
                        />
                        <button
                          onClick={handleScanCode}
                          disabled={!scanCode.trim()}
                          className="w-full flex items-center justify-center px-3 py-3 bg-primary hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 text-sm"
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          <span className="font-medium">Apparaat koppelen</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsModal;