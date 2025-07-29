// Secure storage utilities with basic encryption

// Simple encryption/decryption for localStorage data
const ENCRYPTION_KEY = 'boodschappenlijst_secure_2024';

const simpleEncrypt = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  // Simple XOR encryption with base64 encoding
  let encrypted = '';
  for (let i = 0; i < text.length; i++) {
    encrypted += String.fromCharCode(
      text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
    );
  }
  return btoa(encrypted);
};

const simpleDecrypt = (encryptedText) => {
  if (!encryptedText || typeof encryptedText !== 'string') return null;
  
  try {
    const decoded = atob(encryptedText);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(
        decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      );
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Secure storage wrapper
export const secureStorage = {
  setItem: (key, value) => {
    try {
      const encrypted = simpleEncrypt(value);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Error encrypting storage:', error);
      // Fallback to plain storage
      localStorage.setItem(key, value);
    }
  },

  getItem: (key) => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      const decrypted = simpleDecrypt(encrypted);
      if (decrypted === null) {
        // If decryption fails, assume it's unencrypted and return as-is
        return localStorage.getItem(key);
      }
      return decrypted;
    } catch (error) {
      console.error('Error decrypting storage:', error);
      return localStorage.getItem(key);
    }
  },

  removeItem: (key) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  }
};