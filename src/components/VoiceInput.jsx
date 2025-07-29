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
  const { isListening, transcript, isSupported, error, startListening, stopListening, resetTranscript } = useSpeechRecognition(language);
  const { error: showError, success } = useToast();
  const [hasPermission, setHasPermission] = useState(null);

  // Check microphone permission
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' }).then((result) => {
        setHasPermission(result.state === 'granted');
        
        result.onchange = () => {
          setHasPermission(result.state === 'granted');
        };
      });
    }
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

  // Handle errors
  useEffect(() => {
    if (error) {
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

    // Request microphone permission if not already granted
    if (hasPermission !== true) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
        success('Microfoon toegang verleend! 🎤', 2000);
        // Auto-start listening after permission granted
        setTimeout(() => {
          startListening();
        }, 500);
      } catch (err) {
        setHasPermission(false);
        showError('Microfoon toegang geweigerd. Klik op het slot-icoon in de adresbalk om toegang te verlenen.', 6000);
        return;
      }
    } else {
      startListening();
    }
  };

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
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 animate-pulse' 
            : isListening 
              ? 'bg-gradient-to-r from-accent to-accent/80 text-white p-3' 
              : 'bg-gradient-to-r from-secondary to-secondary/80 hover:opacity-90 text-white p-3'
          }
        `}
        title={
          hasPermission === false 
            ? 'Klik om microfoon toegang te verlenen'
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
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm" />
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
                      className="w-1.5 h-1.5 bg-accent rounded-full"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">Luisteren...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help text for users */}
      <AnimatePresence>
        {hasPermission === null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-20"
          >
            <div className="bg-[rgb(var(--card-bg))] text-[rgb(var(--card-text))] px-3 py-2 rounded-lg shadow-lg border border-[rgb(var(--border-color))]/20 max-w-xs">
              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4 flex-shrink-0 text-secondary" />
                <span className="text-xs">Klik om spraakherkenning te gebruiken</span>
              </div>
            </div>
          </motion.div>
        )}
        {hasPermission === false && (
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