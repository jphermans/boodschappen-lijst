import React from 'react';
import { render } from '@testing-library/react';
import { AppStateProvider } from '../../hooks/useAppState';

// Mock Firebase functions
export const mockFirebaseOperations = {
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
};

// Mock initial state for testing
export const mockInitialState = {
  lists: [],
  currentList: null,
  user: null,
  theme: 'light',
  settings: {
    notifications: true,
    autoSave: true,
    language: 'en'
  },
  ui: {
    currentPage: 'home',
    isLoading: false,
    error: null,
    modals: {
      addList: false,
      editList: false,
      deleteList: false,
      share: false,
      qrScanner: false,
      settings: false,
      userName: false
    }
  },
  forms: {
    addList: { name: '', description: '' },
    editList: { name: '', description: '' },
    addItem: { name: '', quantity: 1, category: '' }
  }
};

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const { initialState = mockInitialState, ...renderOptions } = options;

  const Wrapper = ({ children }) => (
    <AppStateProvider initialState={initialState}>
      {children}
    </AppStateProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Helper to create mock list data
export const createMockList = (overrides = {}) => ({
  id: 'test-list-1',
  name: 'Test Shopping List',
  description: 'A test list for unit testing',
  items: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  userId: 'test-user-1',
  isShared: false,
  sharedWith: [],
  ...overrides
});

// Helper to create mock item data
export const createMockItem = (overrides = {}) => ({
  id: 'test-item-1',
  name: 'Test Item',
  quantity: 1,
  category: 'Other',
  completed: false,
  addedAt: new Date('2024-01-01'),
  completedAt: null,
  notes: '',
  ...overrides
});

// Helper to create mock user data
export const createMockUser = (overrides = {}) => ({
  uid: 'test-user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  ...overrides
});

// Mock localStorage for tests
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock sessionStorage for tests
export const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper to simulate user interactions
export const simulateUserEvent = async (userEvent, element, value) => {
  if (value !== undefined) {
    await userEvent.type(element, value);
  } else {
    await userEvent.click(element);
  }
};

// Mock error for testing error handling
export const createMockError = (message = 'Test error', code = 'test-error') => {
  const error = new Error(message);
  error.code = code;
  return error;
};

// Helper to test async state updates
export const expectStateUpdate = async (getByTestId, testId, expectedValue) => {
  await waitForAsync();
  const element = getByTestId(testId);
  expect(element).toHaveTextContent(expectedValue);
};

// Mock theme context
export const mockThemeContext = {
  theme: 'light',
  setTheme: jest.fn(),
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8'
  }
};

// Helper to reset all mocks
export const resetAllMocks = () => {
  Object.values(mockFirebaseOperations).forEach(mock => mock.mockReset());
  mockLocalStorage.getItem.mockReset();
  mockLocalStorage.setItem.mockReset();
  mockLocalStorage.removeItem.mockReset();
  mockLocalStorage.clear.mockReset();
  mockSessionStorage.getItem.mockReset();
  mockSessionStorage.setItem.mockReset();
  mockSessionStorage.removeItem.mockReset();
  mockSessionStorage.clear.mockReset();
};

// Export everything for easy importing
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Simple test to avoid "no tests" error
describe('testUtils', () => {
  test('should export test utilities', () => {
    expect(renderWithProviders).toBeDefined();
    expect(createMockList).toBeDefined();
    expect(createMockItem).toBeDefined();
    expect(createMockUser).toBeDefined();
  });
});