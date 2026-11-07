import type {Config} from 'jest';

const baseProject: Config = {
	moduleFileExtensions: ['js', 'json', 'ts'],
	transform: {
		'^.+\\.(t|j)s$': 'ts-jest',
	},
	testEnvironment: 'node',
};

const config: Config = {
	collectCoverageFrom: ['<rootDir>/src/**/*.(t|j)s'],
	coverageDirectory: '<rootDir>/coverage',
	projects: [
		{
			...baseProject,
			displayName: 'unit',
			rootDir: 'src',
			roots: ['<rootDir>'],
			testRegex: '.*\\.spec\\.ts$',
			moduleDirectories: ['node_modules', 'src'],
			moduleNameMapper: {
				'@warp-core/test/(.*)': '<rootDir>/../test/$1',
				'@warp-core/(.*)': '<rootDir>/$1',
			},
		},
		{
			...baseProject,
			displayName: 'e2e',
			rootDir: 'test/e2e',
			roots: ['<rootDir>'],
			testRegex: '.*\\.spec\\.ts$',
			moduleNameMapper: {
				'@warp-core/test/(.*)': '<rootDir>/../$1',
				'@warp-core/(.*)': '<rootDir>/../../src/$1',
			},
			setupFiles: ['<rootDir>/utils/setup-env.ts'],
			setupFilesAfterEnv: ['<rootDir>/utils/setup-tests.ts'],
		},
	],
};

export default config;
