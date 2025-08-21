// jest.config.js
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  rootDir: '.',
  moduleFileExtensions: ['ts','tsx','js','jsx','json'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.test.config.js' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],

  // 👇 NUEVO: mocks tempranos
  setupFiles: ['<rootDir>/__tests__/jest.setup.mocks.ts'],

  // 👇 Mantén tus matchers/extensiones aquí
  setupFilesAfterEnv: ['<rootDir>/__tests__/setupTests.ts'],

  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js',
    '!**/babel.test.config.js',
  ],
  globals: { __DEV__: true },
};
