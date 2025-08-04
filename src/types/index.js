import PropTypes from 'prop-types';

/**
 * Type definitions for the Shopping List application
 * This file contains all PropTypes definitions and type validators
 */

// Basic data types
export const ItemType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  completed: PropTypes.bool.isRequired,
  timestamp: PropTypes.number.isRequired,
  category: PropTypes.string,
  priority: PropTypes.oneOf(['low', 'medium', 'high']),
  notes: PropTypes.string,
  quantity: PropTypes.string,
  unit: PropTypes.string,
  price: PropTypes.number,
  addedBy: PropTypes.string,
  completedBy: PropTypes.string,
  completedAt: PropTypes.number
});

export const ShoppingListType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(ItemType).isRequired,
  createdAt: PropTypes.number.isRequired,
  updatedAt: PropTypes.number.isRequired,
  createdBy: PropTypes.string,
  sharedWith: PropTypes.arrayOf(PropTypes.string),
  color: PropTypes.string,
  icon: PropTypes.string,
  isArchived: PropTypes.bool,
  settings: PropTypes.shape({
    allowDuplicates: PropTypes.bool,
    autoSort: PropTypes.bool,
    showCompleted: PropTypes.bool,
    defaultCategory: PropTypes.string
  })
});

export const UserType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  email: PropTypes.string,
  avatar: PropTypes.string,
  preferences: PropTypes.shape({
    theme: PropTypes.string,
    language: PropTypes.string,
    notifications: PropTypes.bool,
    autoSync: PropTypes.bool
  }),
  createdAt: PropTypes.number.isRequired,
  lastActive: PropTypes.number
});

// Theme types
export const ColorType = PropTypes.shape({
  primary: PropTypes.string.isRequired,
  secondary: PropTypes.string.isRequired,
  accent: PropTypes.string.isRequired,
  background: PropTypes.string.isRequired,
  surface: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  textSecondary: PropTypes.string.isRequired,
  border: PropTypes.string.isRequired,
  shadow: PropTypes.string.isRequired,
  success: PropTypes.string.isRequired,
  warning: PropTypes.string.isRequired,
  error: PropTypes.string.isRequired,
  info: PropTypes.string.isRequired
});

export const ThemeType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  colors: ColorType.isRequired,
  isDark: PropTypes.bool.isRequired,
  isCustom: PropTypes.bool,
  createdAt: PropTypes.number,
  updatedAt: PropTypes.number
});

// Context types
export const ToastType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info', 'delete']).isRequired,
  duration: PropTypes.number,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  }),
  persistent: PropTypes.bool,
  timestamp: PropTypes.number.isRequired
});

export const LanguageType = PropTypes.shape({
  code: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  nativeName: PropTypes.string.isRequired,
  flag: PropTypes.string.isRequired,
  rtl: PropTypes.bool
});

// Modal types
export const ModalStateType = PropTypes.shape({
  isOpen: PropTypes.bool.isRequired,
  data: PropTypes.any,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func
});

// QR Code types
export const QRDataType = PropTypes.shape({
  listId: PropTypes.string.isRequired,
  listName: PropTypes.string.isRequired,
  timestamp: PropTypes.number.isRequired,
  signature: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired
});

// Analytics types
export const AnalyticsDataType = PropTypes.shape({
  totalLists: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  completedItems: PropTypes.number.isRequired,
  averageItemsPerList: PropTypes.number.isRequired,
  mostUsedCategories: PropTypes.arrayOf(PropTypes.shape({
    category: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired
  })).isRequired,
  activityByDay: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    items: PropTypes.number.isRequired,
    lists: PropTypes.number.isRequired
  })).isRequired,
  completionRate: PropTypes.number.isRequired,
  averageCompletionTime: PropTypes.number
});

// Device and persistence types
export const DeviceInfoType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['mobile', 'tablet', 'desktop']).isRequired,
  browser: PropTypes.string,
  os: PropTypes.string,
  lastSync: PropTypes.number,
  isOnline: PropTypes.bool.isRequired
});

export const PersistenceStatusType = PropTypes.shape({
  isOnline: PropTypes.bool.isRequired,
  lastSync: PropTypes.number,
  pendingChanges: PropTypes.number.isRequired,
  syncInProgress: PropTypes.bool.isRequired,
  error: PropTypes.string,
  storageQuota: PropTypes.shape({
    used: PropTypes.number.isRequired,
    available: PropTypes.number.isRequired,
    percentage: PropTypes.number.isRequired
  })
});

// Event types
export const EventHandlerType = PropTypes.func;
export const ClickHandlerType = PropTypes.func;
export const ChangeHandlerType = PropTypes.func;
export const SubmitHandlerType = PropTypes.func;

// Common component prop types
export const ChildrenType = PropTypes.oneOfType([
  PropTypes.node,
  PropTypes.arrayOf(PropTypes.node)
]);

export const ClassNameType = PropTypes.string;
export const StyleType = PropTypes.object;
export const RefType = PropTypes.oneOfType([
  PropTypes.func,
  PropTypes.shape({ current: PropTypes.any })
]);

// Form types
export const FormDataType = PropTypes.shape({
  values: PropTypes.object.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object,
  isValid: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired
});

export const ValidationRuleType = PropTypes.shape({
  required: PropTypes.bool,
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
  pattern: PropTypes.instanceOf(RegExp),
  custom: PropTypes.func,
  message: PropTypes.string
});

// Navigation types
export const RouteType = PropTypes.shape({
  path: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  icon: PropTypes.string,
  component: PropTypes.elementType,
  exact: PropTypes.bool,
  private: PropTypes.bool
});

// Settings types
export const SettingsType = PropTypes.shape({
  theme: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  notifications: PropTypes.bool.isRequired,
  autoSync: PropTypes.bool.isRequired,
  offlineMode: PropTypes.bool.isRequired,
  dataRetention: PropTypes.number.isRequired,
  backupFrequency: PropTypes.oneOf(['never', 'daily', 'weekly', 'monthly']).isRequired,
  privacy: PropTypes.shape({
    analytics: PropTypes.bool.isRequired,
    crashReporting: PropTypes.bool.isRequired,
    shareUsageData: PropTypes.bool.isRequired
  }).isRequired,
  accessibility: PropTypes.shape({
    highContrast: PropTypes.bool.isRequired,
    largeText: PropTypes.bool.isRequired,
    reduceMotion: PropTypes.bool.isRequired,
    screenReader: PropTypes.bool.isRequired
  }).isRequired
});

// Voice recognition types
export const SpeechRecognitionType = PropTypes.shape({
  isSupported: PropTypes.bool.isRequired,
  isListening: PropTypes.bool.isRequired,
  transcript: PropTypes.string.isRequired,
  confidence: PropTypes.number,
  error: PropTypes.string,
  interimTranscript: PropTypes.string,
  finalTranscript: PropTypes.string
});

// Custom validators
export const createEnumValidator = (validValues) => {
  return (props, propName, componentName) => {
    const value = props[propName];
    if (value != null && !validValues.includes(value)) {
      return new Error(
        `Invalid prop \`${propName}\` of value \`${value}\` supplied to \`${componentName}\`, expected one of ${JSON.stringify(validValues)}.`
      );
    }
  };
};

export const createArrayOfValidator = (itemValidator) => {
  return (props, propName, componentName) => {
    const value = props[propName];
    if (value != null) {
      if (!Array.isArray(value)) {
        return new Error(
          `Invalid prop \`${propName}\` of type \`${typeof value}\` supplied to \`${componentName}\`, expected an array.`
        );
      }
      for (let i = 0; i < value.length; i++) {
        const error = itemValidator({ [propName]: value[i] }, propName, `${componentName}[${i}]`);
        if (error) {
          return error;
        }
      }
    }
  };
};

export const createShapeValidator = (shape) => {
  return (props, propName, componentName) => {
    const value = props[propName];
    if (value != null) {
      if (typeof value !== 'object' || Array.isArray(value)) {
        return new Error(
          `Invalid prop \`${propName}\` of type \`${typeof value}\` supplied to \`${componentName}\`, expected an object.`
        );
      }
      for (const key in shape) {
        const error = shape[key]({ [key]: value[key] }, key, `${componentName}.${propName}`);
        if (error) {
          return error;
        }
      }
    }
  };
};

// Runtime type validation helpers
export const validateType = (value, validator, name = 'value') => {
  const error = validator({ [name]: value }, name, 'validateType');
  if (error) {
    throw error;
  }
  return true;
};

export const isValidType = (value, validator, name = 'value') => {
  try {
    return validateType(value, validator, name);
  } catch {
    return false;
  }
};

// Type guards
export const isItem = (value) => isValidType(value, ItemType);
export const isShoppingList = (value) => isValidType(value, ShoppingListType);
export const isUser = (value) => isValidType(value, UserType);
export const isTheme = (value) => isValidType(value, ThemeType);
export const isToast = (value) => isValidType(value, ToastType);
export const isQRData = (value) => isValidType(value, QRDataType);

// Default props helpers
export const getDefaultProps = (componentName) => {
  const defaults = {
    // Common defaults
    className: '',
    style: {},
    disabled: false,
    loading: false,
    
    // Modal defaults
    isOpen: false,
    onClose: () => {},
    
    // Form defaults
    required: false,
    readOnly: false,
    
    // List defaults
    items: [],
    
    // Theme defaults
    variant: 'default',
    size: 'medium',
    
    // Toast defaults
    type: 'info',
    duration: 5000,
    persistent: false
  };
  
  return defaults;
};

export default {
  ItemType,
  ShoppingListType,
  UserType,
  ColorType,
  ThemeType,
  ToastType,
  LanguageType,
  ModalStateType,
  QRDataType,
  AnalyticsDataType,
  DeviceInfoType,
  PersistenceStatusType,
  EventHandlerType,
  ClickHandlerType,
  ChangeHandlerType,
  SubmitHandlerType,
  ChildrenType,
  ClassNameType,
  StyleType,
  RefType,
  FormDataType,
  ValidationRuleType,
  RouteType,
  SettingsType,
  SpeechRecognitionType,
  createEnumValidator,
  createArrayOfValidator,
  createShapeValidator,
  validateType,
  isValidType,
  isItem,
  isShoppingList,
  isUser,
  isTheme,
  isToast,
  isQRData,
  getDefaultProps
};