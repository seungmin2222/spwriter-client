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
    'plugin:react/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', '*.spec.jsx'],
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
      files: ['**/*.jsx'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'prettier', 'react-hooks'],
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
      "depth": 25,}]
  },
  settings: {
    react: {
      version: 'detect',
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
