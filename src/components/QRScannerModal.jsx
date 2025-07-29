import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Upload, AlertCircle, Scan } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const QRScannerModal = ({ onClose, onScanSuccess }) => {
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [scanMethod, setScanMethod] = useState('camera'); // 'camera' or 'manual'
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (scanMethod === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [scanMethod]);

  const startCamera = async () => {
    try {
      setError('');
      setCameraReady(false);
      
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
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraReady(true);
          startScanning();
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera toegang geweigerd. Gebruik de handmatige invoer optie.');
      setScanMethod('manual');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  };

  const startScanning = () => {
    if (!videoRef.current || !cameraReady) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const scanFrame = () => {
      if (!videoRef.current || !cameraReady || isProcessing) return;
      
      try {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        // Simple QR detection placeholder - in a real implementation you'd use a QR library here
        // For now, we'll rely on manual input as the primary method
        
        if (cameraReady && !isProcessing) {
          setTimeout(scanFrame, 100);
        }
      } catch (err) {
        console.error('Scanning error:', err);
      }
    };
    
    scanFrame();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('📱 Processing uploaded QR image file');
      showError('Upload functie wordt nog verbeterd. Gebruik handmatige invoer voor nu.');
      setScanMethod('manual');
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
      setIsProcessing(true);
      
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
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center lg:items-start justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[rgb(var(--card-bg))] rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden mt-0 lg:mt-24"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border-color))]/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
              <Scan className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--card-text))]">
              QR-code scannen
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[rgb(var(--border-color))]/20 transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--text-color))]/60" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Method Selection */}
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setScanMethod('camera');
                setError('');
                setIsProcessing(false);
              }}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                scanMethod === 'camera'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                  : 'bg-[rgb(var(--border-color))]/20 text-[rgb(var(--text-color))]/80 hover:bg-[rgb(var(--border-color))]/30'
              }`}
            >
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </button>
            <button
              onClick={() => {
                setScanMethod('manual');
                setError('');
                setIsProcessing(false);
              }}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                scanMethod === 'manual'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
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
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-[rgb(var(--text-color))]/80 mb-6 leading-relaxed">{error}</p>
                  <button
                    onClick={() => setScanMethod('manual')}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Gebruik handmatige invoer
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-2xl overflow-hidden aspect-square">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-4 border-2 border-white/30 rounded-2xl">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-xl">
                          {/* Corner indicators */}
                          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                        </div>
                      </div>
                    </div>
                    
                    {!cameraReady && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="bg-white rounded-xl px-4 py-2 flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm font-medium">Camera starten...</span>
                        </div>
                      </div>
                    )}
                    
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="bg-white rounded-xl px-4 py-2 flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm font-medium">Verwerken...</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center space-y-4">
                    <p className="text-[rgb(var(--text-color))]/80 leading-relaxed">
                      Camera is gestart. Gebruik handmatige invoer voor het beste resultaat.
                    </p>
                    
                    <div className="flex space-x-3">
                      <label className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white rounded-xl cursor-pointer transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Afbeelding
                        <input
                          ref={fileInputRef}
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
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[rgb(var(--text-color))]/80 mb-3">
                  Plak de gedeelde link of QR-code hier:
                </label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="https://... of QR-code tekst"
                  className="w-full px-4 py-4 border border-[rgb(var(--border-color))]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))] placeholder-[rgb(var(--text-color))]/40 transition-all duration-200"
                />
              </div>
              
              <button
                onClick={handleManualSubmit}
                disabled={!manualCode.trim() || isProcessing}
                className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 font-semibold"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span>Verwerken...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-5 h-5 mr-3" />
                    <span>Code Verwerken</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRScannerModal;