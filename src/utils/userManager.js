import { secureStorage } from './secureStorage';

const USER_NAME_KEY = 'user_name';
const USER_ID_KEY = 'user_id';

export const userManager = {
  // Get the current user's name
  getUserName: () => {
    return secureStorage.getItem(USER_NAME_KEY);
  },

  // Set the current user's name
  setUserName: (name) => {
    if (name && typeof name === 'string' && name.trim().length > 0) {
      secureStorage.setItem(USER_NAME_KEY, name.trim());
      return true;
    }
    return false;
  },

  // Check if user has set their name
  hasUserName: () => {
    const name = secureStorage.getItem(USER_NAME_KEY);
    return name && name.trim().length > 0;
  },

  // Clear user name (for logout/reset)
  clearUserName: () => {
    secureStorage.removeItem(USER_NAME_KEY);
  },

  // Get user display info
  getUserInfo: () => {
    const name = secureStorage.getItem(USER_NAME_KEY);
    return {
      name: name || null,
      hasName: name && name.trim().length > 0
    };
  },

  // Validate user name
  validateUserName: (name) => {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Naam is verplicht' };
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length === 0) {
      return { valid: false, error: 'Naam mag niet leeg zijn' };
    }

    if (trimmedName.length < 2) {
      return { valid: false, error: 'Naam moet minimaal 2 karakters lang zijn' };
    }

    if (trimmedName.length > 50) {
      return { valid: false, error: 'Naam mag maximaal 50 karakters lang zijn' };
    }

    // Check for valid characters (letters, numbers, spaces, basic punctuation)
    if (!/^[a-zA-Z0-9\s\-_.àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+$/i.test(trimmedName)) {
      return { valid: false, error: 'Naam bevat ongeldige karakters' };
    }

    return { valid: true, value: trimmedName };
  }
};