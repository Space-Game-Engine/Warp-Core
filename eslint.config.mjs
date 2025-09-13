import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {fixupConfigRules, fixupPluginRules} from '@eslint/compat';
import {FlatCompat} from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
// eslint-disable-next-line import/default
import tsParser from '@typescript-eslint/parser';
import {defineConfig, globalIgnores} from 'eslint/config';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default defineConfig([
	globalIgnores([
		'**/node_modules',
		'**/dist',
		'**/node_modules/**/*',
		'**/*.d.ts',
		'**/*.js',
	]),
	{
		extends: fixupConfigRules(
			compat.extends(
				'plugin:@typescript-eslint/eslint-recommended',
				'plugin:@typescript-eslint/recommended',
				'prettier',
				'plugin:prettier/recommended',
				'plugin:import/recommended',
				'plugin:import/typescript',
			),
		),

		plugins: {
			'@typescript-eslint': fixupPluginRules(typescriptEslintEslintPlugin),
			'unused-imports': unusedImports,
		},

		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest,
			},

			parser: tsParser,
		},

		settings: {
			'import/parsers': {
				'@typescript-eslint/parser': ['.ts'],
			},

			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
				},
			},
		},

		rules: {
			'no-fallthrough': 'error',
			'prettier/prettier': 'error',
			'@typescript-eslint/no-explicit-any': 'error',

			'import/order': [
				'error',
				{
					'newlines-between': 'always',

					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},
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
	},
]);
