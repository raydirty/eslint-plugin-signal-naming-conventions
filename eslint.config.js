const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const eslintPluginPlugin = require('eslint-plugin-eslint-plugin').default;

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', 'eslint.config.js'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  {
    files: ['src/rules/**/*.ts'],
    ...eslintPluginPlugin.configs['rules-recommended'],
  },
  {
    files: ['tests/**/*.ts'],
    ...eslintPluginPlugin.configs['tests-recommended'],
  },
];
