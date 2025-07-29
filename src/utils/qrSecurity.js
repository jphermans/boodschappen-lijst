// QR code security validation utilities

export const validateQRData = (scannedData) => {
  if (!scannedData || typeof scannedData !== 'string') {
    return { valid: false, error: 'Ongeldige QR-code' };
  }

  try {
    // Check if it's a URL format
    let listId = null;
    
    // Clean the input - remove any potential script tags or dangerous characters
    const cleanData = scannedData.replace(/[\u003c\u003e"'\u0026]/g, '');
    
    // Validate URL format
    if (cleanData.includes('/shared/')) {
      const parts = cleanData.split('/shared/');
      if (parts.length === 2) {
        const potentialId = parts[1].split(/[?#]/)[0]; // Remove query params and fragments
        
        // Validate list ID format (alphanumeric, underscore, hyphen)
        if (/^[a-zA-Z0-9_-]+$/.test(potentialId) && potentialId.length >= 10 && potentialId.length <= 30) {
          listId = potentialId;
        }
      }
    } else if (cleanData.includes('#')) {
      // Handle legacy format
      const parts = cleanData.split('#');
      if (parts.length === 2) {
        const potentialId = parts[1];
        if (/^[a-zA-Z0-9_-]+$/.test(potentialId) && potentialId.length >= 10 && potentialId.length <= 30) {
          listId = potentialId;
        }
      }
    } else {
      // Direct ID format
      if (/^[a-zA-Z0-9_-]+$/.test(cleanData) && cleanData.length >= 10 && cleanData.length <= 30) {
        listId = cleanData;
      }
    }

    if (!listId) {
      return { valid: false, error: 'Ongeldige lijst ID in QR-code' };
    }

    // Additional security checks
    // Block known malicious patterns
    const maliciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i,
      /\\.exe$/i,
      /\\.bat$/i,
      /\\.sh$/i,
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(cleanData)) {
        return { valid: false, error: 'Potentieel onveilige QR-code geblokkeerd' };
      }
    }

    return { valid: true, listId };

  } catch (err) {
    return { valid: false, error: 'Fout bij verwerken van QR-code' };
  }
};

export const sanitizeQRInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[\u003c\u003e"'\u0026]/g, '');
};