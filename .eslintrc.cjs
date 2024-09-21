const globals = require('globals');
const pluginJs = require('@eslint/js');
const pluginReactConfig = require('eslint-plugin-react/configs/recommended.js');

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
    '*.spec.jsx',
    '*.spec.tsx',
    '*.test.jsx',
    'coverage/**/*',
    'postcss.config.js',
    'tailwind.config.js'
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
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'plugin:@typescript-eslint/recommended',
      ],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      files: ['**/*.js', '**/*.jsx'],
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
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
    semi: 'warn',
    'no-unused-vars': 'warn',
    'import/no-extraneous-dependencies': 'off',
    'react/prop-types': 'off',
    'react/button-has-type': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-no-bind': 'off',
    'react/self-closing-comp': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': 'warn',
    'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx'] }],
    'no-param-reassign': 0,
    'global-require': 0,
    'no-underscore-dangle': 'off',
    'no-restricted-syntax': 'off',
    'no-cond-assign': 'off',
    'no-use-before-define': 'off',
    'no-await-in-loop': 'off',
    'radix': 'off',
    'no-plusplus': 'off',
    'max-classes-per-file': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'jsx-a11y/no-noninteractive-tabindex': 'off',
    "jsx-a11y/label-has-associated-control": [ "error", {
      "labelComponents": [],
      "labelAttributes": [],
      "controlComponents": [],
      "assert": "either",
      "depth": 25,}],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {},
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
