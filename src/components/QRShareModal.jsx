import React from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Download } from 'lucide-react';
import QRCode from 'react-qr-code';

const QRShareModal = ({ listId, onClose }) => {
  const shareUrl = `${window.location.origin}/shared/${listId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link gekopieerd naar klembord!');
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
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Deel boodschappenlijst
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Scan de QR-code om deze boodschappenlijst te delen
            </p>
            
            <div className="flex justify-center mb-4">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <QRCode
                  id="qr-code"
                  value={shareUrl}
                  size={200}
                  level="H"
                  className="w-full h-full"
                />
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <p className="font-medium mb-2">Deellink:</p>
              <p className="text-xs break-all font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                {shareUrl}
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Kopieer link</span>
              </button>
              <button
                onClick={downloadQR}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download QR</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>
              Iedereen met deze link kan de lijst bekijken en bewerken.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRShareModal;