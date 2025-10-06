// eslint.config.js
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module'
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      semi: ['error', 'always'],
      quotes: ['error', 'double'],
      indent: ['error', 2],
      'comma-dangle': ['error', 'never'],
      'no-console': 'warn',
      curly: 'error'
    }
  }
];
