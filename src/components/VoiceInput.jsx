import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useToast } from '../context/ToastContext';

const VoiceInput = ({ 
  onTranscript, 
  placeholder = "Spreek uit...", 
  language = 'nl-NL',
  className = "",
  autoSubmit = false
}) => {
  const { isListening, transcript, isSupported, error, isTimingOut, remainingTime, startListening, stopListening, resetTranscript } = useSpeechRecognition(language);
  const { error: showError, success } = useToast();
  const [hasPermission, setHasPermission] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Check microphone permission - simplified approach
  useEffect(() => {
    const checkPermission = async () => {
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' });
          setHasPermission(result.state === 'granted');
          
          // Only show popup if permission is explicitly denied
          if (result.state === 'denied') {
            setShowPopup(true);
          }
          
          result.onchange = () => {
            setHasPermission(result.state === 'granted');
            setShowPopup(result.state === 'denied');
          };
        } catch (err) {
          // Fallback: assume no permission initially
          setHasPermission(false);
        }
      }
    };
    
    checkPermission();
  }, []);

  // Handle transcript changes
  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
      
      if (autoSubmit) {
        success(`"${transcript}" toegevoegd via spraak! 🎤`, 2000);
      }
      
      // Reset transcript after use
      setTimeout(() => {
        resetTranscript();
      }, 100);
    }
  }, [transcript, onTranscript, autoSubmit, success, resetTranscript]);

  // Handle errors - simplified
  useEffect(() => {
    if (error) {
      // Handle permission-related errors
      if (error === 'Microfoon toegang geweigerd.' || error === 'Microfoon niet beschikbaar.') {
        setHasPermission(false);
        setShowPopup(true);
      }
      
      // Show error toast
      showError(error, 3000);
    }
  }, [error, showError]);

  const handleVoiceInput = async () => {
    if (!isSupported) {
      showError('Spraakherkenning wordt niet ondersteund in deze browser.', 4000);
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    // If permission is already granted, start listening immediately
    if (hasPermission === true) {
      startListening();
      return;
    }

    // If permission is unknown or denied, try to get permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setShowPopup(false);
      
      // Show success message only if permission was previously not granted
      if (hasPermission !== true) {
        success('Microfoon toegang verleend! Klik nogmaals om te beginnen. 🎤', 2000);
      }
    } catch (err) {
      setHasPermission(false);
      setShowPopup(true);
      showError('Microfoon toegang geweigerd. Klik op het slot-icoon in de adresbalk om toegang te verlenen.', 6000);
      return;
    }
  };

  // Enhanced error recovery
  useEffect(() => {
    // If there's an error and we're still marked as listening, clean up the state
    if (error && isListening) {
      setTimeout(() => {
        // This helps recover from stuck listening states
        if (isListening && error) {
          stopListening();
        }
      }, 100);
    }
  }, [error, isListening, stopListening]);

  if (!isSupported) {
    return null; // Hide component if not supported
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={handleVoiceInput}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative flex items-center justify-center rounded-xl shadow-lg hover:shadow-xl
          transform transition-all duration-200 overflow-hidden
          ${hasPermission === false
            ? 'bg-[rgb(var(--warning-color))] text-white px-4 py-3 animate-pulse'
            : isTimingOut
              ? 'bg-[rgb(var(--warning-color))] text-white p-3'
              : isListening
                ? 'bg-[rgb(var(--accent-color))] hover:opacity-90 text-white p-3'
                : 'bg-[rgb(var(--secondary-color))] hover:opacity-90 text-white p-3'
          }
        `}
        title={
          hasPermission === false
            ? 'Klik om microfoon toegang te verlenen'
            : isTimingOut
              ? `Stopt over ${Math.ceil(remainingTime / 1000)}s`
              : isListening
                ? 'Stop opname'
                : `${placeholder}`
        }
      >
        {/* Background pulse animation when listening */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: [0.3, 0.6, 0.3] }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-white rounded-xl"
            />
          )}
        </AnimatePresence>

        {/* Icon and Text */}
        <motion.div
          animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.6, repeat: isListening ? Infinity : 0 }}
          className="relative z-10 flex items-center space-x-2"
        >
          {hasPermission === false ? (
            <>
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium text-sm">Microfoon toegang</span>
            </>
          ) : isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </motion.div>

        {/* Liquid glass effect */}
        <div className="absolute inset-0 rounded-xl bg-white/10 backdrop-blur-sm" />
      </motion.button>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-20"
          >
            <div className="bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))] px-3 py-2 rounded-lg shadow-lg border border-[rgb(var(--border-color))]/20">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ 
                        duration: 0.6, 
                        repeat: Infinity, 
                        delay: i * 0.2 
                      }}
                      className="w-1.5 h-1.5 bg-[rgb(var(--accent-color))] rounded-full"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">Luisteren...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeout indicator */}
      <AnimatePresence>
        {isTimingOut && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-20"
          >
            <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-3 py-2 rounded-lg shadow-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full border-2 border-current relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-current origin-center"
                    style={{
                      clipPath: `polygon(50% 50%, 50% 0%, ${
                        50 + 50 * Math.cos(2 * Math.PI * (1 - remainingTime / 3000) - Math.PI/2)
                      }% ${
                        50 + 50 * Math.sin(2 * Math.PI * (1 - remainingTime / 3000) - Math.PI/2)
                      }%, 50% 50%)`
                    }}
                  />
                </div>
                <span className="text-sm font-medium">
                  Stopt over {Math.ceil(remainingTime / 1000)}s
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help text - DISABLED to fix popup issue */}
      <AnimatePresence>
        {false && showPopup && !isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-20"
          >
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg shadow-lg border border-red-200 dark:border-red-800 max-w-sm">
              <div className="text-xs space-y-1">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">Microfoon toegang vereist</span>
                </div>
                <div className="text-xs opacity-90">
                  Klik op het 🔒 icoon in de adresbalk → Microfoon → Toestaan
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInput; 