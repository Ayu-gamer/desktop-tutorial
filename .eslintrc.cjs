module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    complexity: ['error', 10],
    'max-depth': ['error', 3],
    '@typescript-eslint/no-explicit-any': 'error'
  },
  ignorePatterns: ['dist/', 'node_modules/', 'temp.html']
};
