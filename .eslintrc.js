module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'standard',
    'plugin:prettier/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'import', 'react', 'prettier', 'jsx-a11y'],
  rules: {
    'no-unused-vars': [2, { varsIgnorePattern: 'React|jsx|h' }],
    'react/jsx-uses-vars': 2,
    'no-undef': 0,
    'import/no-absolute-path': 0
  }
}
