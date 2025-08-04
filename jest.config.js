export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }]
      ]
    }]
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx}'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/setupTests.js',
    '!src/**/__tests__/**',
    '!src/**/*.test.{js,jsx}',
    '!src/**/*.spec.{js,jsx}',
    '!src/__mocks__/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    // Specific thresholds for tested utility functions
    'src/utils/validation.js': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    },
    'src/utils/deviceUID.js': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    },
    'src/utils/qrSecurity.js': {
      branches: 90,
      functions: 100,
      lines: 90,
      statements: 90
    },
    'src/components/Toast.jsx': {
      branches: 75,
      functions: 75,
      lines: 80,
      statements: 80
    }
  },
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  testTimeout: 10000
};