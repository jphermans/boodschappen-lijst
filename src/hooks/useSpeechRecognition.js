import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = (language = 'nl-NL') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  // Auto-detect Dutch language variant based on user locale
  const detectLanguage = useCallback(() => {
    const locale = navigator.language || navigator.languages?.[0] || 'nl-NL';
    if (locale.startsWith('nl-BE')) return 'nl-BE';
    return 'nl-NL'; // Default to Netherlands Dutch
  }, []);

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
      };
      
      recognition.onend = () => {
        setIsListening(false);
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
        
        if (finalTranscript) {
          const processedText = processVoiceCommand(finalTranscript.trim());
          setTranscript(processedText);
        }
      };
      
      recognition.onerror = (event) => {
        setIsListening(false);
        
        switch (event.error) {
          case 'no-speech':
            setError('Geen spraak gedetecteerd. Probeer opnieuw.');
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
  }, [language, detectLanguage]);

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
      try {
        recognitionRef.current.start();
      } catch (err) {
        setError('Kan spraakherkenning niet starten.');
      }
    }
  }, [isListening, isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError('');
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  };
}; 