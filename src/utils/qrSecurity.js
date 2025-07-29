// QR code security validation utilities

export const validateQRData = (scannedData) => {
  console.log('🔍 QR Validation Debug - Input data:', scannedData);
  console.log('🔍 Input type:', typeof scannedData);
  console.log('🔍 Input length:', scannedData?.length);
  
  if (!scannedData || typeof scannedData !== 'string') {
    console.error('❌ Invalid input: not a string or empty');
    return { valid: false, error: 'Ongeldige QR-code: geen geldige tekst' };
  }

  if (scannedData.length > 500) {
    console.error('❌ Input too long:', scannedData.length);
    return { valid: false, error: 'QR-code te lang' };
  }

  try {
    // Check if it's a URL format
    let listId = null;
    
    // Clean the input - remove any potential script tags or dangerous characters
    const cleanData = scannedData.trim().replace(/[\u003c\u003e"'\u0026]/g, '');
    console.log('🧹 Cleaned data:', cleanData);
    
    // Validate URL format - check for #/shared/ pattern first
    if (cleanData.includes('#/shared/')) {
      console.log('🔍 Detected #/shared/ pattern');
      const parts = cleanData.split('#/shared/');
      console.log('🔍 Split parts:', parts);
      
      if (parts.length === 2) {
        const potentialId = parts[1].split(/[?#]/)[0]; // Remove query params and fragments
        console.log('🔍 Potential ID from #/shared/:', potentialId);
        
        // Validate list ID format (alphanumeric, underscore, hyphen)
        if (/^[a-zA-Z0-9_-]+$/.test(potentialId) && potentialId.length >= 10 && potentialId.length <= 30) {
          listId = potentialId;
          console.log('✅ Valid list ID from #/shared/:', listId);
        } else {
          console.log('❌ Invalid ID format from #/shared/:', potentialId, 'length:', potentialId.length);
        }
      }
    } else if (cleanData.includes('/shared/')) {
      console.log('🔍 Detected /shared/ pattern');
      const parts = cleanData.split('/shared/');
      console.log('🔍 Split parts:', parts);
      
      if (parts.length === 2) {
        const potentialId = parts[1].split(/[?#]/)[0]; // Remove query params and fragments
        console.log('🔍 Potential ID from /shared/:', potentialId);
        
        // Validate list ID format (alphanumeric, underscore, hyphen)
        if (/^[a-zA-Z0-9_-]+$/.test(potentialId) && potentialId.length >= 10 && potentialId.length <= 30) {
          listId = potentialId;
          console.log('✅ Valid list ID from /shared/:', listId);
        } else {
          console.log('❌ Invalid ID format from /shared/:', potentialId, 'length:', potentialId.length);
        }
      }
    } else if (cleanData.includes('#')) {
      console.log('🔍 Detected legacy # pattern');
      const parts = cleanData.split('#');
      console.log('🔍 Split parts:', parts);
      
      if (parts.length === 2) {
        const potentialId = parts[1];
        console.log('🔍 Potential ID from #:', potentialId);
        
        if (/^[a-zA-Z0-9_-]+$/.test(potentialId) && potentialId.length >= 10 && potentialId.length <= 30) {
          listId = potentialId;
          console.log('✅ Valid list ID from #:', listId);
        } else {
          console.log('❌ Invalid ID format from #:', potentialId, 'length:', potentialId.length);
        }
      }
    } else {
      console.log('🔍 Checking direct ID format');
      // Direct ID format
      if (/^[a-zA-Z0-9_-]+$/.test(cleanData) && cleanData.length >= 10 && cleanData.length <= 30) {
        listId = cleanData;
        console.log('✅ Valid direct list ID:', listId);
      } else {
        console.log('❌ Invalid direct ID format:', cleanData, 'length:', cleanData.length);
      }
    }

    if (!listId) {
      console.error('❌ No valid list ID found');
      return { valid: false, error: 'Ongeldige lijst ID in QR-code. Controleer of de QR-code correct is.' };
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

    console.log('🔍 Running security checks...');
    for (const pattern of maliciousPatterns) {
      if (pattern.test(cleanData)) {
        console.error('❌ Malicious pattern detected:', pattern);
        return { valid: false, error: 'Potentieel onveilige QR-code geblokkeerd' };
      }
    }

    console.log('✅ QR validation successful, list ID:', listId);
    return { valid: true, listId };

  } catch (err) {
    console.error('❌ Exception in QR validation:', err);
    return { valid: false, error: `Fout bij verwerken van QR-code: ${err.message}` };
  }
};

export const sanitizeQRInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[\u003c\u003e"'\u0026]/g, '');
};