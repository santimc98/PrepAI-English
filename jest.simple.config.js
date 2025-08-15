module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  verbose: true,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  // Mock AsyncStorage for tests
  setupFilesAfterEnv: ['<rootDir>/__tests__/setupTests.ts'],
  moduleNameMapper: {
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/async-storage.ts',
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native$': '<rootDir>/__mocks__/react-native.ts',
    '^expo-application$': '<rootDir>/__mocks__/expo-application.ts',
  },
};
