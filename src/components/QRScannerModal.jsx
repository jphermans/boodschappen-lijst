import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Upload, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const QRScannerModal = ({ onClose, onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [scanMethod, setScanMethod] = useState('camera'); // 'camera' or 'manual'
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (scanMethod === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [scanMethod]);

  const startCamera = async () => {
    try {
      setError('');
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 400 },
          height: { ideal: 400 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera toegang geweigerd. Gebruik de handmatige invoer optie.');
      setScanMethod('manual');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // For now, we'll just show a message that file upload QR scanning needs additional library
          showError('QR code scannen van bestanden vereist aanvullende bibliotheek. Gebruik handmatige invoer.');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      processQRCode(manualCode.trim());
    }
  };

  const processQRCode = (code) => {
    console.log('📱 QRScannerModal - Processing QR code:', code);
    console.log('📱 QRScannerModal - Original hash before processing:', window.location.hash);
    
    try {
      // Store original hash to restore later
      const originalHash = window.location.hash;
      
      // Close the modal first to prevent any UI interference
      onClose();
      
      // Small delay to ensure modal is closed before processing
      setTimeout(() => {
        console.log('📱 QRScannerModal - Calling onScanSuccess with code:', code);
        
        // Pass the code directly to the main handler - let it do all validation
        onScanSuccess(code);
        
        // Restore the original hash if it was changed during processing
        setTimeout(() => {
          if (window.location.hash !== originalHash) {
            console.log('📱 QRScannerModal - Restoring original hash:', originalHash);
            window.location.hash = originalHash;
          }
        }, 100);
        
        success('QR-code succesvol gescand! 🎉');
      }, 100);
      
    } catch (err) {
      console.error('📱 QRScannerModal - Error processing QR code:', err);
      showError('Fout bij verwerken van QR-code');
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
            QR-code scannen
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[rgb(var(--border-color))]/20 transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--text-color))]/60" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Method Selection */}
          <div className="flex space-x-2">
            <button
              onClick={() => setScanMethod('camera')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 ${
                scanMethod === 'camera'
                  ? 'bg-primary text-white'
                  : 'bg-[rgb(var(--border-color))]/20 text-[rgb(var(--text-color))]/80 hover:bg-[rgb(var(--border-color))]/30'
              }`}
            >
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </button>
            <button
              onClick={() => setScanMethod('manual')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 ${
                scanMethod === 'manual'
                  ? 'bg-primary text-white'
                  : 'bg-[rgb(var(--border-color))]/20 text-[rgb(var(--text-color))]/80 hover:bg-[rgb(var(--border-color))]/30'
              }`}
            >
              Handmatig
            </button>
          </div>

          {scanMethod === 'camera' ? (
            <div className="space-y-4">
              {error ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-accent mx-auto mb-4" />
                  <p className="text-[rgb(var(--text-color))]/80 mb-4">{error}</p>
                  <button
                    onClick={() => setScanMethod('manual')}
                    className="px-4 py-2 bg-primary hover:opacity-90 text-white rounded-lg transition-colors"
                  >
                    Gebruik handmatige invoer
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-lg"></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-[rgb(var(--text-color))]/80 mb-4">
                      Houd de QR-code binnen het vierkant
                    </p>
                    
                    <div className="space-y-2">
                      <label className="flex items-center justify-center px-4 py-2 bg-secondary hover:opacity-90 text-white rounded-lg cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload QR-afbeelding
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text-color))]/80 mb-2">
                  Plak de gedeelde link of QR-code hier:
                </label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="https://... of QR-code tekst"
                  className="w-full px-4 py-3 border border-[rgb(var(--border-color))] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))]"
                />
              </div>
              
              <button
                onClick={handleManualSubmit}
                disabled={!manualCode.trim()}
                className="w-full flex items-center justify-center px-4 py-3 bg-primary hover:opacity-90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
              >
                <span className="font-medium">📝 Code verwerken</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRScannerModal; 