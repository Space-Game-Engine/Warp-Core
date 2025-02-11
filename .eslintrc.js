module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin', 'unused-imports'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"]
    },
    'import/resolver': {
      'typescript': {
        "alwaysTryTypes": true,
      }
    }
  },
  rules: {
    'no-fallthrough': 'error',
    'prettier/prettier': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        overrides: {
          accessors: 'explicit',
          constructors: 'off',
          methods: 'explicit',
          properties: 'explicit',
          parameterProperties: 'explicit',
        },
      },
    ],
    'import/no-unresolved': 'error',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/array-type': [
      'error',
      {
        default: 'array',
        readonly: 'array',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'error',
    'unused-imports/no-unused-imports': 'error',
  },
  ignorePatterns: ['node_modules', 'dist'],
};
