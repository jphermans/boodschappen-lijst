/**
 * Centralized Error Handler
 * Provides comprehensive error handling, logging, and retry mechanisms
 */

// Error types for categorization
export const ERROR_TYPES = {
  NETWORK: 'network',
  FIREBASE: 'firebase',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown',
  USER_INPUT: 'user_input',
  STORAGE: 'storage',
  QR_CODE: 'qr_code'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.retryAttempts = new Map();
    this.setupGlobalErrorHandlers();
  }

  /**
   * Setup global error handlers for unhandled errors
   */
  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.logError(event.reason, {
        type: ERROR_TYPES.UNKNOWN,
        severity: ERROR_SEVERITY.HIGH,
        source: 'unhandledrejection'
      });
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.logError(event.error, {
        type: ERROR_TYPES.UNKNOWN,
        severity: ERROR_SEVERITY.MEDIUM,
        source: 'global',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
  }

  /**
   * Log an error with context information
   */
  logError(error, context = {}) {
    const errorEntry = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message || String(error),
        stack: error?.stack,
        name: error?.name
      },
      context: {
        type: context.type || ERROR_TYPES.UNKNOWN,
        severity: context.severity || ERROR_SEVERITY.MEDIUM,
        component: context.component,
        action: context.action,
        userId: this.getCurrentUserId(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context
      }
    };

    // Add to error log
    this.errorLog.push(errorEntry);

    // Keep only last 100 errors to prevent memory issues
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error [${errorEntry.context.severity.toUpperCase()}]`);
      console.error('Message:', errorEntry.error.message);
      console.error('Type:', errorEntry.context.type);
      console.error('Context:', errorEntry.context);
      if (errorEntry.error.stack) {
        console.error('Stack:', errorEntry.error.stack);
      }
      console.groupEnd();
    }

    // Send to external logging service in production (if configured)
    if (process.env.NODE_ENV === 'production' && window.analytics) {
      try {
        window.analytics.track('Error Occurred', {
          errorId: errorEntry.id,
          errorType: errorEntry.context.type,
          errorSeverity: errorEntry.context.severity,
          errorMessage: errorEntry.error.message,
          component: errorEntry.context.component
        });
      } catch (analyticsError) {
        console.warn('Failed to send error to analytics:', analyticsError);
      }
    }

    return errorEntry.id;
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error, context = {}) {
    const errorType = context.type || this.categorizeError(error);
    
    const messages = {
      [ERROR_TYPES.NETWORK]: {
        [ERROR_SEVERITY.LOW]: 'Verbinding is traag. Probeer het opnieuw.',
        [ERROR_SEVERITY.MEDIUM]: 'Geen internetverbinding. Controleer je verbinding.',
        [ERROR_SEVERITY.HIGH]: 'Netwerkfout. Probeer het later opnieuw.',
        [ERROR_SEVERITY.CRITICAL]: 'Ernstige netwerkfout. Herlaad de pagina.'
      },
      [ERROR_TYPES.FIREBASE]: {
        [ERROR_SEVERITY.LOW]: 'Gegevens worden gesynchroniseerd...',
        [ERROR_SEVERITY.MEDIUM]: 'Kan gegevens niet opslaan. Probeer het opnieuw.',
        [ERROR_SEVERITY.HIGH]: 'Database fout. Controleer je internetverbinding.',
        [ERROR_SEVERITY.CRITICAL]: 'Kan geen verbinding maken met de database.'
      },
      [ERROR_TYPES.PERMISSION]: {
        [ERROR_SEVERITY.LOW]: 'Beperkte toegang tot deze functie.',
        [ERROR_SEVERITY.MEDIUM]: 'Je hebt geen toestemming voor deze actie.',
        [ERROR_SEVERITY.HIGH]: 'Toegang geweigerd. Log opnieuw in.',
        [ERROR_SEVERITY.CRITICAL]: 'Account toegang geblokkeerd.'
      },
      [ERROR_TYPES.VALIDATION]: {
        [ERROR_SEVERITY.LOW]: 'Controleer je invoer.',
        [ERROR_SEVERITY.MEDIUM]: 'Ongeldige gegevens ingevoerd.',
        [ERROR_SEVERITY.HIGH]: 'Gegevens kunnen niet worden verwerkt.',
        [ERROR_SEVERITY.CRITICAL]: 'Ernstige validatiefout.'
      },
      [ERROR_TYPES.QR_CODE]: {
        [ERROR_SEVERITY.LOW]: 'QR-code niet duidelijk. Probeer opnieuw.',
        [ERROR_SEVERITY.MEDIUM]: 'Ongeldige QR-code. Controleer de code.',
        [ERROR_SEVERITY.HIGH]: 'QR-code kan niet worden gelezen.',
        [ERROR_SEVERITY.CRITICAL]: 'QR-scanner fout.'
      },
      [ERROR_TYPES.STORAGE]: {
        [ERROR_SEVERITY.LOW]: 'Gegevens worden opgeslagen...',
        [ERROR_SEVERITY.MEDIUM]: 'Kan gegevens niet opslaan lokaal.',
        [ERROR_SEVERITY.HIGH]: 'Opslagfout. Ruimte beschikbaar?',
        [ERROR_SEVERITY.CRITICAL]: 'Kritieke opslagfout.'
      }
    };

    const severity = context.severity || ERROR_SEVERITY.MEDIUM;
    const typeMessages = messages[errorType];
    
    if (typeMessages && typeMessages[severity]) {
      return typeMessages[severity];
    }

    // Fallback messages
    const fallbackMessages = {
      [ERROR_SEVERITY.LOW]: 'Er is een klein probleem opgetreden.',
      [ERROR_SEVERITY.MEDIUM]: 'Er ging iets mis. Probeer het opnieuw.',
      [ERROR_SEVERITY.HIGH]: 'Er is een fout opgetreden. Herlaad de pagina.',
      [ERROR_SEVERITY.CRITICAL]: 'Kritieke fout. Neem contact op met ondersteuning.'
    };

    return fallbackMessages[severity] || 'Er is een onbekende fout opgetreden.';
  }

  /**
   * Categorize error based on error message and properties
   */
  categorizeError(error) {
    if (!error) return ERROR_TYPES.UNKNOWN;

    const message = error.message?.toLowerCase() || '';
    const code = error.code?.toLowerCase() || '';

    // Network errors
    if (message.includes('network') || message.includes('fetch') || 
        message.includes('connection') || code.includes('network')) {
      return ERROR_TYPES.NETWORK;
    }

    // Firebase errors
    if (message.includes('firebase') || code.includes('auth') || 
        code.includes('firestore') || message.includes('permission-denied')) {
      return ERROR_TYPES.FIREBASE;
    }

    // Permission errors
    if (message.includes('permission') || message.includes('unauthorized') ||
        code.includes('permission-denied') || code.includes('unauthenticated')) {
      return ERROR_TYPES.PERMISSION;
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') ||
        message.includes('required') || message.includes('format')) {
      return ERROR_TYPES.VALIDATION;
    }

    // QR Code errors
    if (message.includes('qr') || message.includes('scan') || 
        message.includes('camera') || message.includes('decode')) {
      return ERROR_TYPES.QR_CODE;
    }

    // Storage errors
    if (message.includes('storage') || message.includes('quota') ||
        message.includes('localstorage') || message.includes('indexeddb')) {
      return ERROR_TYPES.STORAGE;
    }

    return ERROR_TYPES.UNKNOWN;
  }

  /**
   * Execute function with retry logic
   */
  async withRetry(fn, options = {}) {
    const config = { ...RETRY_CONFIG, ...options };
    const operationId = this.generateErrorId();
    
    let lastError;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await fn();
        
        // Clear retry attempts on success
        if (attempt > 0) {
          this.retryAttempts.delete(operationId);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Log retry attempt
        this.logError(error, {
          type: this.categorizeError(error),
          severity: attempt === config.maxRetries ? ERROR_SEVERITY.HIGH : ERROR_SEVERITY.LOW,
          component: options.component || 'withRetry',
          action: options.action || 'retry',
          attempt: attempt + 1,
          maxRetries: config.maxRetries + 1
        });

        // Don't retry on final attempt
        if (attempt === config.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay
        );

        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000;

        await this.sleep(jitteredDelay);
      }
    }

    // All retries failed
    throw lastError;
  }

  /**
   * Handle Firebase-specific errors with retry logic
   */
  async handleFirebaseOperation(operation, context = {}) {
    return this.withRetry(operation, {
      maxRetries: 2,
      component: context.component || 'Firebase',
      action: context.action || 'operation'
    });
  }

  /**
   * Get current user ID for error context
   */
  getCurrentUserId() {
    try {
      // Try to get from persistent storage
      if (window.persistentStorage) {
        return window.persistentStorage.getItem('user_id') || 'anonymous';
      }
      return 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    const recentErrors = this.errorLog.filter(
      error => new Date(error.timestamp).getTime() > oneHourAgo
    );

    const dailyErrors = this.errorLog.filter(
      error => new Date(error.timestamp).getTime() > oneDayAgo
    );

    const errorsByType = {};
    const errorsBySeverity = {};

    dailyErrors.forEach(error => {
      const type = error.context.type;
      const severity = error.context.severity;

      errorsByType[type] = (errorsByType[type] || 0) + 1;
      errorsBySeverity[severity] = (errorsBySeverity[severity] || 0) + 1;
    });

    return {
      total: this.errorLog.length,
      lastHour: recentErrors.length,
      lastDay: dailyErrors.length,
      byType: errorsByType,
      bySeverity: errorsBySeverity,
      mostRecent: this.errorLog[this.errorLog.length - 1]
    };
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
    this.retryAttempts.clear();
  }

  /**
   * Export error log for debugging
   */
  exportErrorLog() {
    return {
      errors: this.errorLog,
      stats: this.getErrorStats(),
      exportedAt: new Date().toISOString()
    };
  }
}

// Create global instance
const errorHandler = new ErrorHandler();

// Make it available globally
if (typeof window !== 'undefined') {
  window.errorHandler = errorHandler;
}

export default errorHandler;