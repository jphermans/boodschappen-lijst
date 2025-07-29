import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = (language = 'nl-NL') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const [silenceTimer, setSilenceTimer] = useState(null);
  const [timeoutDuration] = useState(3000); // 3 seconds
  const [lastErrorTime, setLastErrorTime] = useState(0);
  const [errorDebounceTime] = useState(1000); // 1 second debounce
  const [isTimingOut, setIsTimingOut] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const recognitionRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Auto-detect Dutch language variant based on user locale
  const detectLanguage = useCallback(() => {
    const locale = navigator.language || navigator.languages?.[0] || 'nl-NL';
    if (locale.startsWith('nl-BE')) return 'nl-BE';
    return 'nl-NL'; // Default to Netherlands Dutch
  }, []);

  // Clear silence timer and countdown
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsTimingOut(false);
    setRemainingTime(0);
  }, [silenceTimer]);

  // Check if we should show this error (debouncing logic)
  const shouldShowError = useCallback((errorType) => {
    const now = Date.now();
    const timeSinceLastError = now - lastErrorTime;
    
    // Don't show no-speech errors during timeout countdown
    if (errorType === 'no-speech' && isTimingOut) {
      return false;
    }
    
    // Debounce all errors
    if (timeSinceLastError < errorDebounceTime) {
      return false;
    }
    
    return true;
  }, [lastErrorTime, errorDebounceTime, isTimingOut]);

  // Start silence timer with visual countdown
  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    
    setIsTimingOut(true);
    setRemainingTime(timeoutDuration);
    
    // Visual countdown updates every 100ms
    countdownIntervalRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 100) {
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    
    // Actual timeout
    const timer = setTimeout(() => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      stopListeningGracefully();
    }, timeoutDuration);
    
    setSilenceTimer(timer);
  }, [timeoutDuration, clearSilenceTimer]);

  // Reset silence timer (called when speech is detected)
  const resetSilenceTimer = useCallback(() => {
    if (isListening) {
      startSilenceTimer();
    }
  }, [isListening, startSilenceTimer]);

  // Graceful stop function (no error on timeout)
  const stopListeningGracefully = useCallback(() => {
    if (recognitionRef.current && isListening) {
      clearSilenceTimer();
      
      // Override onend to prevent error handling during graceful stop
      const originalOnEnd = recognitionRef.current.onend;
      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Restore original onend handler
        if (recognitionRef.current) {
          recognitionRef.current.onend = originalOnEnd;
        }
      };
      
      recognitionRef.current.stop();
    }
  }, [isListening, clearSilenceTimer]);

  useEffect(() => {
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language || detectLanguage();
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        setIsListening(true);
        setError('');
        // Start silence timer when recognition begins
        startSilenceTimer();
      };
      
      recognition.onend = () => {
        setIsListening(false);
        clearSilenceTimer();
      };
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        // Reset silence timer on any speech activity (including interim results)
        if (finalTranscript || interimTranscript) {
          resetSilenceTimer();
        }
        
        if (finalTranscript) {
          const processedText = processVoiceCommand(finalTranscript.trim());
          setTranscript(processedText);
        }
      };
      
      recognition.onerror = (event) => {
        const now = Date.now();
        
        // Clear any existing timers
        clearSilenceTimer();
        setIsListening(false);
        
        // Check if we should show this error
        if (!shouldShowError(event.error)) {
          return;
        }
        
        setLastErrorTime(now);
        
        switch (event.error) {
          case 'no-speech':
            // Only show if not during a graceful timeout
            if (!isTimingOut) {
              setError('Geen spraak gedetecteerd. Probeer opnieuw.');
            }
            break;
          case 'audio-capture':
            setError('Microfoon niet beschikbaar.');
            break;
          case 'not-allowed':
            setError('Microfoon toegang geweigerd.');
            break;
          case 'network':
            setError('Netwerkfout. Controleer je internetverbinding.');
            break;
          default:
            setError('Er ging iets mis met de spraakherkenning.');
        }
      };
    } else {
      setIsSupported(false);
    }

    // Cleanup on unmount
    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, detectLanguage, startSilenceTimer, resetSilenceTimer, clearSilenceTimer, shouldShowError, isTimingOut]);

  // Process Dutch voice commands
  const processVoiceCommand = (transcript) => {
    const cleaned = transcript.toLowerCase().trim();
    
    // Handle common Dutch phrases
    const patterns = [
      { regex: /^voeg toe (.+)/, replacement: '$1' },
      { regex: /^ik heb nodig (.+)/, replacement: '$1' },
      { regex: /^ik wil (.+)/, replacement: '$1' },
      { regex: /^koop (.+)/, replacement: '$1' },
      { regex: /^nieuwe lijst (.+)/, replacement: '$1' },
      { regex: /^maak lijst (.+)/, replacement: '$1' }
    ];
    
    for (const pattern of patterns) {
      if (pattern.regex.test(cleaned)) {
        return cleaned.replace(pattern.regex, pattern.replacement);
      }
    }
    
    return transcript.trim();
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && isSupported) {
      setTranscript('');
      setError('');
      clearSilenceTimer(); // Clear any existing timers
      try {
        recognitionRef.current.start();
      } catch (err) {
        setError('Kan spraakherkenning niet starten.');
        clearSilenceTimer();
      }
    }
  }, [isListening, isSupported, clearSilenceTimer]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError('');
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    error,
    isTimingOut,
    remainingTime,
    startListening,
    stopListening: stopListeningGracefully,
    resetTranscript
  };
}; 