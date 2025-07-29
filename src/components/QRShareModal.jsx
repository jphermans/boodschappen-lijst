import React from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Download } from 'lucide-react';
import QRCode from 'react-qr-code';

const QRShareModal = ({ listId, onClose }) => {
  const shareUrl = `${window.location.origin}${window.location.pathname}#/shared/${listId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      const button = event.target.closest('button');
      const originalText = button.innerHTML;
      button.innerHTML = '<span class="inline-flex items-center"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Gekopieerd!</span>';
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 2000);
    } catch (err) {
      console.error('Kon link niet kopiëren:', err);
      alert('Kon link niet kopiëren. Probeer handmatig te selecteren.');
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `boodschappenlijst-${listId}.png`;
        a.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
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
            Deel boodschappenlijst
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[rgb(var(--border-color))]/20 transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--text-color))]/60" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-[rgb(var(--text-color))]/80 mb-4">
              Scan de QR-code om deze boodschappenlijst te delen
            </p>
            
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-lg shadow-lg border border-[rgb(var(--border-color))]/20">
                <QRCode
                  id="qr-code"
                  value={shareUrl}
                  size={200}
                  level="H"
                  className="w-full h-full"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            </div>

            <div className="text-sm text-[rgb(var(--text-color))]/80 mb-4">
              <p className="font-medium mb-2">Deellink:</p>
              <p className="text-xs break-all font-mono bg-[rgb(var(--border-color))]/20 p-2 rounded">
                {shareUrl}
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-primary hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Copy className="w-4 h-4" />
                <span className="font-medium">📋 Kopieer link</span>
              </button>
              <button
                onClick={downloadQR}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-secondary hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">💾 Download QR</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-[rgb(var(--text-color))]/60 text-center space-y-2">
            <p>
              <strong>Delen met anderen:</strong>
            </p>
            <div className="bg-[rgb(var(--border-color))]/10 p-3 rounded-lg text-left">
              <p className="mb-1">✅ Anderen kunnen items toevoegen en bewerken</p>
              <p className="mb-1">✅ Anderen kunnen items als voltooid markeren</p>
              <p className="text-accent">🔒 Alleen jij kunt de lijst verwijderen</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRShareModal;