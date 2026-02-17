export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    files: ['**/*.jsx', '**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        browser: true,
        es2021: true,
        node: true,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
  },
];
