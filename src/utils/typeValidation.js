/**
 * Runtime Type Validation Utilities
 * Provides comprehensive type checking and validation for the Shopping List application
 */

import { 
  validateType, 
  isValidType, 
  isItem, 
  isShoppingList, 
  isUser, 
  isTheme, 
  isToast, 
  isQRData,
  ItemType,
  ShoppingListType,
  UserType,
  ThemeType,
  ToastType,
  QRDataType,
  AnalyticsDataType,
  DeviceInfoType,
  PersistenceStatusType,
  SettingsType
} from '../types';

/**
 * Enhanced validation with detailed error reporting
 */
export class ValidationError extends Error {
  constructor(message, field, value, expectedType) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.expectedType = expectedType;
  }
}

/**
 * Validates and sanitizes shopping list item data
 */
export const validateItem = (item, strict = false) => {
  try {
    validateType(item, ItemType, 'item');
    
    // Additional business logic validation
    if (strict) {
      if (!item.text || item.text.trim().length === 0) {
        throw new ValidationError('Item text cannot be empty', 'text', item.text, 'non-empty string');
      }
      
      if (item.text.length > 500) {
        throw new ValidationError('Item text too long', 'text', item.text, 'string <= 500 chars');
      }
      
      if (item.priority && !['low', 'medium', 'high'].includes(item.priority)) {
        throw new ValidationError('Invalid priority level', 'priority', item.priority, 'low|medium|high');
      }
      
      if (item.price && (typeof item.price !== 'number' || item.price < 0)) {
        throw new ValidationError('Invalid price', 'price', item.price, 'positive number');
      }
    }
    
    return {
      valid: true,
      item: sanitizeItem(item),
      errors: []
    };
  } catch (error) {
    return {
      valid: false,
      item: null,
      errors: [error.message]
    };
  }
};

/**
 * Validates and sanitizes shopping list data
 */
export const validateShoppingList = (list, strict = false) => {
  try {
    validateType(list, ShoppingListType, 'list');
    
    // Additional business logic validation
    if (strict) {
      if (!list.name || list.name.trim().length === 0) {
        throw new ValidationError('List name cannot be empty', 'name', list.name, 'non-empty string');
      }
      
      if (list.name.length > 100) {
        throw new ValidationError('List name too long', 'name', list.name, 'string <= 100 chars');
      }
      
      // Validate all items in the list
      const itemErrors = [];
      list.items.forEach((item, index) => {
        const itemValidation = validateItem(item, strict);
        if (!itemValidation.valid) {
          itemErrors.push(`Item ${index}: ${itemValidation.errors.join(', ')}`);
        }
      });
      
      if (itemErrors.length > 0) {
        throw new ValidationError('Invalid items in list', 'items', list.items, 'valid items array');
      }
    }
    
    return {
      valid: true,
      list: sanitizeShoppingList(list),
      errors: []
    };
  } catch (error) {
    return {
      valid: false,
      list: null,
      errors: [error.message]
    };
  }
};

/**
 * Validates user data
 */
export const validateUser = (user, strict = false) => {
  try {
    validateType(user, UserType, 'user');
    
    if (strict) {
      if (!user.name || user.name.trim().length === 0) {
        throw new ValidationError('User name cannot be empty', 'name', user.name, 'non-empty string');
      }
      
      if (user.name.length > 50) {
        throw new ValidationError('User name too long', 'name', user.name, 'string <= 50 chars');
      }
      
      if (user.email && !isValidEmail(user.email)) {
        throw new ValidationError('Invalid email format', 'email', user.email, 'valid email');
      }
    }
    
    return {
      valid: true,
      user: sanitizeUser(user),
      errors: []
    };
  } catch (error) {
    return {
      valid: false,
      user: null,
      errors: [error.message]
    };
  }
};

/**
 * Validates theme data
 */
export const validateTheme = (theme) => {
  try {
    validateType(theme, ThemeType, 'theme');
    
    // Validate color format
    const colors = theme.colors;
    const colorFields = ['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'textSecondary', 'border', 'shadow', 'success', 'warning', 'error', 'info'];
    
    for (const field of colorFields) {
      if (!isValidColor(colors[field])) {
        throw new ValidationError(`Invalid color format for ${field}`, field, colors[field], 'valid color string');
      }
    }
    
    return {
      valid: true,
      theme: sanitizeTheme(theme),
      errors: []
    };
  } catch (error) {
    return {
      valid: false,
      theme: null,
      errors: [error.message]
    };
  }
};

/**
 * Validates toast data
 */
export const validateToast = (toast) => {
  try {
    validateType(toast, ToastType, 'toast');
    
    if (!toast.message || toast.message.trim().length === 0) {
      throw new ValidationError('Toast message cannot be empty', 'message', toast.message, 'non-empty string');
    }
    
    return {
      valid: true,
      toast: sanitizeToast(toast),
      errors: []
    };
  } catch (error) {
    return {
      valid: false,
      toast: null,
      errors: [error.message]
    };
  }
};

/**
 * Validates QR code data
 */
export const validateQRData = (qrData) => {
  try {
    validateType(qrData, QRDataType, 'qrData');
    
    // Additional QR-specific validation
    if (!qrData.signature || qrData.signature.length < 10) {
      throw new ValidationError('Invalid QR signature', 'signature', qrData.signature, 'valid signature string');
    }
    
    if (!qrData.version || !qrData.version.match(/^\d+\.\d+\.\d+$/)) {
      throw new ValidationError('Invalid version format', 'version', qrData.version, 'semver format');
    }
    
    return {
      valid: true,
      qrData: sanitizeQRData(qrData),
      errors: []
    };
  } catch (error) {
    return {
      valid: false,
      qrData: null,
      errors: [error.message]
    };
  }
};

/**
 * Sanitization functions to clean and normalize data
 */
export const sanitizeItem = (item) => ({
  ...item,
  text: item.text?.trim() || '',
  notes: item.notes?.trim() || '',
  quantity: item.quantity?.trim() || '',
  unit: item.unit?.trim() || '',
  category: item.category?.trim() || '',
  price: typeof item.price === 'number' ? Math.max(0, item.price) : item.price
});

export const sanitizeShoppingList = (list) => ({
  ...list,
  name: list.name?.trim() || '',
  items: list.items?.map(sanitizeItem) || [],
  sharedWith: list.sharedWith?.filter(id => id && typeof id === 'string') || []
});

export const sanitizeUser = (user) => ({
  ...user,
  name: user.name?.trim() || '',
  email: user.email?.trim().toLowerCase() || ''
});

export const sanitizeTheme = (theme) => ({
  ...theme,
  name: theme.name?.trim() || '',
  colors: {
    ...theme.colors,
    // Ensure all colors are valid
    ...Object.fromEntries(
      Object.entries(theme.colors).map(([key, value]) => [
        key,
        isValidColor(value) ? value : '#000000'
      ])
    )
  }
});

export const sanitizeToast = (toast) => ({
  ...toast,
  message: toast.message?.trim() || '',
  duration: typeof toast.duration === 'number' ? Math.max(1000, toast.duration) : 5000
});

export const sanitizeQRData = (qrData) => ({
  ...qrData,
  listName: qrData.listName?.trim() || '',
  version: qrData.version?.trim() || '1.0.0'
});

/**
 * Helper validation functions
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  
  // Check hex colors
  if (color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) return true;
  
  // Check rgb/rgba colors
  if (color.match(/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/)) return true;
  
  // Check hsl/hsla colors
  if (color.match(/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/)) return true;
  
  // Check named colors (basic set)
  const namedColors = ['red', 'green', 'blue', 'white', 'black', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray', 'grey'];
  if (namedColors.includes(color.toLowerCase())) return true;
  
  return false;
};

export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidTimestamp = (timestamp) => {
  if (typeof timestamp === 'number') {
    return timestamp > 0 && timestamp <= Date.now() + 86400000; // Allow up to 1 day in future
  }
  if (timestamp instanceof Date) {
    return !isNaN(timestamp.getTime());
  }
  return false;
};

/**
 * Batch validation for arrays of data
 */
export const validateItems = (items, strict = false) => {
  const results = items.map((item, index) => ({
    index,
    ...validateItem(item, strict)
  }));
  
  const valid = results.every(result => result.valid);
  const validItems = results.filter(result => result.valid).map(result => result.item);
  const errors = results.filter(result => !result.valid).map(result => `Item ${result.index}: ${result.errors.join(', ')}`);
  
  return {
    valid,
    items: validItems,
    errors,
    totalCount: items.length,
    validCount: validItems.length,
    invalidCount: items.length - validItems.length
  };
};

export const validateShoppingLists = (lists, strict = false) => {
  const results = lists.map((list, index) => ({
    index,
    ...validateShoppingList(list, strict)
  }));
  
  const valid = results.every(result => result.valid);
  const validLists = results.filter(result => result.valid).map(result => result.list);
  const errors = results.filter(result => !result.valid).map(result => `List ${result.index}: ${result.errors.join(', ')}`);
  
  return {
    valid,
    lists: validLists,
    errors,
    totalCount: lists.length,
    validCount: validLists.length,
    invalidCount: lists.length - validLists.length
  };
};

/**
 * Development mode validation helpers
 */
export const enableStrictValidation = () => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('🔍 Strict type validation enabled for development');
    return true;
  }
  return false;
};

export const logValidationError = (error, context = '') => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`🚨 Validation Error ${context}:`, error);
  }
};

/**
 * Type guards with enhanced error reporting
 */
export const assertItem = (value, context = '') => {
  if (!isItem(value)) {
    const error = new ValidationError(`Expected valid Item${context ? ` in ${context}` : ''}`, 'item', value, 'Item');
    logValidationError(error, context);
    throw error;
  }
  return value;
};

export const assertShoppingList = (value, context = '') => {
  if (!isShoppingList(value)) {
    const error = new ValidationError(`Expected valid ShoppingList${context ? ` in ${context}` : ''}`, 'list', value, 'ShoppingList');
    logValidationError(error, context);
    throw error;
  }
  return value;
};

export const assertUser = (value, context = '') => {
  if (!isUser(value)) {
    const error = new ValidationError(`Expected valid User${context ? ` in ${context}` : ''}`, 'user', value, 'User');
    logValidationError(error, context);
    throw error;
  }
  return value;
};

export const assertTheme = (value, context = '') => {
  if (!isTheme(value)) {
    const error = new ValidationError(`Expected valid Theme${context ? ` in ${context}` : ''}`, 'theme', value, 'Theme');
    logValidationError(error, context);
    throw error;
  }
  return value;
};

export default {
  ValidationError,
  validateItem,
  validateShoppingList,
  validateUser,
  validateTheme,
  validateToast,
  validateQRData,
  sanitizeItem,
  sanitizeShoppingList,
  sanitizeUser,
  sanitizeTheme,
  sanitizeToast,
  sanitizeQRData,
  isValidEmail,
  isValidColor,
  isValidURL,
  isValidTimestamp,
  validateItems,
  validateShoppingLists,
  enableStrictValidation,
  logValidationError,
  assertItem,
  assertShoppingList,
  assertUser,
  assertTheme
};