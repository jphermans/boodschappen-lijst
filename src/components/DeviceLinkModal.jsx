import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Scan, Link2, Smartphone } from 'lucide-react';
import QRCode from 'react-qr-code';

const DeviceLinkModal = ({ currentDeviceUID, onClose, onLinkDevice }) => {
  const [linkType, setLinkType] = useState('generate'); // generate or scan
  const [scanCode, setScanCode] = useState('');

  const generateLinkCode = () => {
    return `${currentDeviceUID}-${Date.now()}`;
  };

  const handleScan = async () => {
    if (scanCode.trim()) {
      const masterDeviceUID = scanCode.split('-')[0];
      if (masterDeviceUID) {
        onLinkDevice(masterDeviceUID);
        onClose();
      }
    }
  };

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
        className="bg-[rgb(var(--card-bg))] rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border-color))]/50">
          <h2 className="text-xl font-semibold text-[rgb(var(--card-text))]">
            Apparaten koppelen
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[rgb(var(--border-color))]/20 transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--text-color))]/60" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex space-x-3">
            <button
              onClick={() => setLinkType('generate')}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 ${
                linkType === 'generate'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-[rgb(var(--border-color))]/20 text-[rgb(var(--text-color))]/80 hover:bg-[rgb(var(--border-color))]/30 hover:scale-105'
              }`}
            >
              <Scan className="w-4 h-4 mr-2" />
              <span className="font-medium">📱 Genereer code</span>
            </button>
            <button
              onClick={() => setLinkType('scan')}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 ${
                linkType === 'scan'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-[rgb(var(--border-color))]/20 text-[rgb(var(--text-color))]/80 hover:bg-[rgb(var(--border-color))]/30 hover:scale-105'
              }`}
            >
              <Link2 className="w-4 h-4 mr-2" />
              <span className="font-medium">🔗 Scan code</span>
            </button>
          </div>

          {linkType === 'generate' ? (
            <div className="text-center">
              <p className="text-[rgb(var(--text-color))]/80 mb-4">
                Scan deze QR-code op een ander apparaat om dezelfde lijsten te gebruiken:
              </p>
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <QRCode
                    value={generateLinkCode()}
                    size={200}
                    level="H"
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
              </div>
              <p className="text-sm text-[rgb(var(--text-color))]/60">
                <Smartphone className="w-4 h-4 inline mr-1" />
                Open de app op een ander apparaat en kies "Scan code"
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[rgb(var(--text-color))]/80">
                Vul de code in van het hoofdapparaat:
              </p>
              <input
                type="text"
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                placeholder="Code invoeren..."
                className="w-full px-4 py-2 border border-[rgb(var(--border-color))] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))]"
              />
              <button
                onClick={handleScan}
                disabled={!scanCode.trim()}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
              >
                <Link2 className="w-4 h-4 mr-2" />
                <span className="font-medium">🔗 Apparaat koppelen</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeviceLinkModal;