const globals = require('globals');

   module.exports = {
     env: {
       browser: true,
       node: true,
       es2022: true,
     },
     extends: [
       'airbnb',
       'airbnb-typescript',
       'plugin:react/recommended',
       'plugin:@typescript-eslint/recommended',
       'plugin:prettier/recommended',
     ],
     ignorePatterns: [
       'dist',
       '.eslintrc.cjs',
       '*.spec.tsx',
       '*.test.tsx',
       'coverage/**/*',
       'postcss.config.js',
       'tailwind.config.js',
       'README.md',
     ],
     overrides: [
       {
         env: {
           node: true,
         },
         files: ['.eslintrc.{js,cjs}', './tailwind.config.js', 'README.md'],
         parserOptions: {
           sourceType: 'module',
         },
       },
     ],
     parser: '@typescript-eslint/parser',
     parserOptions: {
       ecmaFeatures: {
         jsx: true,
       },
       ecmaVersion: 'latest',
       sourceType: 'module',
       project: './tsconfig.json',
     },
     plugins: ['react', 'prettier', 'react-hooks', '@typescript-eslint'],
     rules: {
      'no-plusplus': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-use-before-define': 'off',
      'import/no-extraneous-dependencies': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'max-classes-per-file': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/no-noninteractive-tabindex': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'plugin:import/typescript': 'off',
      "no-restricted-syntax": ["off"]
     },
     settings: {
       react: {
         version: 'detect',
       },
       'import/resolver': {
         typescript: {
           alwaysTryTypes: true,
         },
         node: {
           extensions: ['.ts', '.tsx']
         },
       },
     },
     globals: {
       ...globals.browser,
       Office: 'readonly',
       Excel: 'readonly',
       Word: 'readonly',
       OneNote: 'readonly',
       PowerPoint: 'readonly',
       Outlook: 'readonly',
       OfficeRuntime: 'readonly',
     },
   };