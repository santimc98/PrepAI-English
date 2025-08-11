// .eslintrc.cjs
module.exports = {
  root: true,
  extends: [
    'expo',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: false,
  },
  plugins: ['@typescript-eslint', 'react-hooks'],
  settings: {
    react: { version: 'detect' },
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'web-build/',
    '.expo/',
    'android/',
    'ios/',
    '**/*.d.ts',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off', // TS + react-jsx
    'react/jsx-no-target-blank': 'off',
    'react/jsx-no-undef': 'off',
    // Disable import plugin rules temporarily to avoid resolver issues
    'import/order': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/newline-after-import': 'off',
    'import/no-duplicates': 'off',
    'import/namespace': 'off',
    'react-native/no-inline-styles': 'off',
    'react-native/no-raw-text': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'no-console': 'off',
    'no-undef': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-use-before-define': 'off',
    'no-shadow': 'off',
    'react/no-unstable-nested-components': 'off',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};
