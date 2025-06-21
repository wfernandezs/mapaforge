module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'airbnb',
    'airbnb/hooks'
  ],
  env: {
    node: true,
    es6: true,
    browser: true,
    jest: true
  },
  rules: {
    'import/extensions': ['error', 'ignorePackages', {
      'ts': 'never',
      'tsx': 'never'
    }],
    'import/resolver': {
      'typescript': {}
    },
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'max-len': ['error', { code: 100 }],
    'complexity': ['error', 10],
    'max-lines': ['error', 300],
    'max-lines-per-function': ['error', 30]
  },
  settings: {
    'import/resolver': {
      'typescript': {
        'alwaysTryTypes': true
      }
    }
  }
};