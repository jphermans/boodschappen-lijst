# Type Safety Documentation

This document provides comprehensive documentation for the type safety implementation in the Shopping List application.

## Overview

The application uses PropTypes for runtime type checking and validation. This provides:

- **Runtime Type Validation**: Catches type errors during development and testing
- **Component Interface Documentation**: Clear contracts for component props
- **Enhanced Developer Experience**: Better error messages and debugging
- **Data Integrity**: Ensures data consistency across the application

## Type Definitions

### Core Data Types

#### ItemType
Represents a single shopping list item.

```javascript
{
  id: string (required),           // Unique identifier
  text: string (required),         // Item description
  completed: boolean (required),   // Completion status
  timestamp: number (required),    // Creation timestamp
  category: string (optional),     // Item category
  priority: 'low'|'medium'|'high' (optional), // Priority level
  notes: string (optional),        // Additional notes
  quantity: string (optional),     // Quantity description
  unit: string (optional),         // Unit of measurement
  price: number (optional),        // Item price
  addedBy: string (optional),      // User who added the item
  completedBy: string (optional),  // User who completed the item
  completedAt: number (optional)   // Completion timestamp
}
```

#### ShoppingListType
Represents a complete shopping list.

```javascript
{
  id: string (required),           // Unique identifier
  name: string (required),         // List name
  items: ItemType[] (required),    // Array of items
  createdAt: number (required),    // Creation timestamp
  updatedAt: number (required),    // Last update timestamp
  createdBy: string (optional),    // Creator user ID
  sharedWith: string[] (optional), // Array of shared user IDs
  color: string (optional),        // List color theme
  icon: string (optional),         // List icon
  isArchived: boolean (optional),  // Archive status
  settings: {                      // List settings
    allowDuplicates: boolean (optional),
    autoSort: boolean (optional),
    showCompleted: boolean (optional),
    defaultCategory: string (optional)
  } (optional)
}
```

#### UserType
Represents a user in the system.

```javascript
{
  id: string (required),           // Unique identifier
  name: string (required),         // Display name
  email: string (optional),        // Email address
  avatar: string (optional),       // Avatar URL
  preferences: {                   // User preferences
    theme: string (optional),
    language: string (optional),
    notifications: boolean (optional),
    autoSync: boolean (optional)
  } (optional),
  createdAt: number (required),    // Account creation timestamp
  lastActive: number (optional)    // Last activity timestamp
}
```

### UI Component Types

#### ToastType
Represents a toast notification.

```javascript
{
  id: string (required),           // Unique identifier
  message: string (required),      // Toast message
  type: 'success'|'error'|'warning'|'info' (required), // Toast type
  duration: number (optional),     // Display duration in ms
  action: {                        // Optional action button
    label: string (required),
    onClick: function (required)
  } (optional),
  persistent: boolean (optional),  // Whether toast persists
  timestamp: number (required)     // Creation timestamp
}
```

#### ThemeType
Represents a theme configuration.

```javascript
{
  id: string (required),           // Unique identifier
  name: string (required),         // Theme name
  colors: ColorType (required),    // Color palette
  isDark: boolean (required),      // Dark mode flag
  isCustom: boolean (optional),    // Custom theme flag
  createdAt: number (optional),    // Creation timestamp
  updatedAt: number (optional)     // Last update timestamp
}
```

#### ColorType
Represents a color palette.

```javascript
{
  primary: string (required),      // Primary color
  secondary: string (required),    // Secondary color
  accent: string (required),       // Accent color
  background: string (required),   // Background color
  surface: string (required),      // Surface color
  text: string (required),         // Text color
  textSecondary: string (required), // Secondary text color
  border: string (required),       // Border color
  shadow: string (required),       // Shadow color
  success: string (required),      // Success color
  warning: string (required),      // Warning color
  error: string (required),        // Error color
  info: string (required)          // Info color
}
```

### Event Handler Types

#### EventHandlerType
Generic event handler function.

```javascript
function(event?: Event): void
```

#### ClickHandlerType
Click event handler function.

```javascript
function(event: MouseEvent): void
```

#### ChangeHandlerType
Change event handler function.

```javascript
function(event: ChangeEvent): void
```

#### SubmitHandlerType
Form submit handler function.

```javascript
function(event: FormEvent): void
```

### Common Component Props

#### ChildrenType
React children prop.

```javascript
ReactNode | ReactNode[]
```

#### ClassNameType
CSS class name string.

```javascript
string
```

#### StyleType
Inline style object.

```javascript
CSSProperties
```

#### RefType
React ref object.

```javascript
RefObject<any> | function(instance: any): void
```

## Component PropTypes

### Example Component with PropTypes

```javascript
import React from 'react';
import PropTypes from 'prop-types';
import { ItemType, EventHandlerType, ClassNameType } from '../types';

const ItemComponent = ({ item, onToggle, onDelete, className }) => {
  // Component implementation
};

ItemComponent.propTypes = {
  item: ItemType.isRequired,
  onToggle: EventHandlerType.isRequired,
  onDelete: EventHandlerType.isRequired,
  className: ClassNameType
};

ItemComponent.defaultProps = {
  className: ''
};

export default ItemComponent;
```

## Runtime Validation

### Using Type Validation Utilities

```javascript
import { validateItem, validateShoppingList, assertItem } from '../utils/typeValidation';

// Validate and sanitize data
const itemValidation = validateItem(rawItemData, true); // strict mode
if (itemValidation.valid) {
  const cleanItem = itemValidation.item;
  // Use validated item
} else {
  console.error('Validation errors:', itemValidation.errors);
}

// Assert types (throws on invalid data)
try {
  const validItem = assertItem(someData, 'API response');
  // Use validated item
} catch (error) {
  console.error('Type assertion failed:', error.message);
}
```

### Validation Options

#### Strict Mode
When `strict = true`, validation includes business logic rules:

- **Items**: Non-empty text, reasonable length limits, valid priority levels
- **Lists**: Non-empty names, valid items, proper sharing configuration
- **Users**: Valid email format, reasonable name length
- **Themes**: Valid color formats, required color properties

#### Sanitization
All validation functions include automatic data sanitization:

- Trim whitespace from strings
- Normalize email addresses
- Ensure numeric values are within valid ranges
- Filter invalid array elements
- Provide sensible defaults for missing optional fields

## Custom Validators

### Creating Custom Validators

```javascript
import { createEnumValidator, createArrayOfValidator } from '../types';

// Enum validator
const StatusValidator = createEnumValidator(['active', 'inactive', 'pending']);

// Array validator
const ItemArrayValidator = createArrayOfValidator(ItemType);

// Custom shape validator
const CustomValidator = (props, propName, componentName) => {
  const value = props[propName];
  if (value != null && !isValidCustomType(value)) {
    return new Error(`Invalid prop ${propName} supplied to ${componentName}`);
  }
};
```

### Validation Helpers

```javascript
import { isValidEmail, isValidColor, isValidURL, isValidTimestamp } from '../utils/typeValidation';

// Email validation
if (!isValidEmail(userEmail)) {
  throw new Error('Invalid email format');
}

// Color validation
if (!isValidColor(themeColor)) {
  throw new Error('Invalid color format');
}

// URL validation
if (!isValidURL(avatarUrl)) {
  throw new Error('Invalid URL format');
}

// Timestamp validation
if (!isValidTimestamp(createdAt)) {
  throw new Error('Invalid timestamp');
}
```

## Development vs Production

### Development Mode Features

- **Detailed Error Messages**: Full validation error details with context
- **Console Warnings**: PropTypes warnings for invalid props
- **Strict Validation**: Enhanced business logic validation
- **Performance Monitoring**: Type checking performance metrics

### Production Mode Optimizations

- **Minimal Overhead**: PropTypes are stripped in production builds
- **Error Logging**: Validation errors logged to error tracking service
- **Graceful Degradation**: Invalid data handled gracefully without crashes
- **Performance**: Minimal runtime type checking overhead

## Best Practices

### Component Development

1. **Always Define PropTypes**: Every component should have complete PropTypes definitions
2. **Use Default Props**: Provide sensible defaults for optional props
3. **Validate Early**: Validate data at component boundaries
4. **Handle Invalid Data**: Gracefully handle validation failures

### Data Flow

1. **Validate at Boundaries**: Validate data when it enters the application (API responses, user input)
2. **Sanitize Consistently**: Use validation utilities to clean and normalize data
3. **Assert Critical Paths**: Use type assertions for critical business logic
4. **Log Validation Errors**: Track validation failures for debugging

### Performance

1. **Use Strict Mode Judiciously**: Only enable strict validation where necessary
2. **Cache Validation Results**: Avoid re-validating the same data repeatedly
3. **Batch Validations**: Use batch validation utilities for arrays of data
4. **Profile in Development**: Monitor type checking performance impact

## Testing Type Safety

### Unit Tests for Validation

```javascript
import { validateItem, ValidationError } from '../utils/typeValidation';

describe('Item Validation', () => {
  test('validates correct item data', () => {
    const validItem = {
      id: '123',
      text: 'Test item',
      completed: false,
      timestamp: Date.now()
    };
    
    const result = validateItem(validItem);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  test('rejects invalid item data', () => {
    const invalidItem = {
      id: 123, // should be string
      text: '',
      completed: 'false', // should be boolean
      timestamp: 'invalid' // should be number
    };
    
    const result = validateItem(invalidItem);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

### Component PropTypes Testing

```javascript
import { render } from '@testing-library/react';
import ItemComponent from '../ItemComponent';

// Suppress PropTypes warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

test('warns on invalid props', () => {
  render(<ItemComponent item="invalid" />);
  expect(console.error).toHaveBeenCalledWith(
    expect.stringContaining('Warning: Failed prop type')
  );
});
```

## Migration Guide

### Adding PropTypes to Existing Components

1. **Import PropTypes**: Add PropTypes import to component files
2. **Import Type Definitions**: Import relevant types from `../types`
3. **Define PropTypes**: Add PropTypes definition after component
4. **Add Default Props**: Define default values for optional props
5. **Test Thoroughly**: Ensure all prop combinations work correctly

### Updating Data Handling

1. **Add Validation**: Use validation utilities at data entry points
2. **Handle Errors**: Implement proper error handling for validation failures
3. **Update Tests**: Add type validation tests for critical paths
4. **Monitor Production**: Track validation errors in production

This type safety implementation provides a robust foundation for maintaining data integrity and catching errors early in the development process.