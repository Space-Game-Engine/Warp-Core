import {ExecutionContext} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {when} from 'jest-when';

import {loginAuthHeaderKey} from '@warp-core/auth/constants';
import {InternalLoginAuthGuard} from '@warp-core/auth/guard/internal-login-auth.guard';

describe(InternalLoginAuthGuard.name, () => {
	it('should allow when header token and whitelisted ip are empty', () => {
		const whitelistedIp = '';
		const headerTokenToLogin = '';

		const config = getConfig(headerTokenToLogin, whitelistedIp);
		const requestContext = getContext(
			{
				header: 'test-header',
			},
			'0.0.0.0',
		);

		const guardService = new InternalLoginAuthGuard(config);

		const canActivate = guardService.canActivate(requestContext);

		expect(canActivate).toBeTruthy();
	});

	it('should allow when header token is defined and equals request one and whitelisted ip config is empty', () => {
		const whitelistedIp = '';
		const headerTokenToLogin = 'game-token';

		const config = getConfig(headerTokenToLogin, whitelistedIp);
		const requestContext = getContext(
			{
				header: 'test-header',
				[loginAuthHeaderKey]: headerTokenToLogin,
			},
			'0.0.0.0',
		);

		const guardService = new InternalLoginAuthGuard(config);

		const canActivate = guardService.canActivate(requestContext);

		expect(canActivate).toBeTruthy();
	});

	it('should allow when header token is not defined and whitelisted ip config is defined and equals request', () => {
		const whitelistedIp = '128.0.0.1';
		const headerTokenToLogin = '';

		const config = getConfig(headerTokenToLogin, whitelistedIp);
		const requestContext = getContext(
			{
				header: 'test-header',
			},
			'128.0.0.1',
		);

		const guardService = new InternalLoginAuthGuard(config);

		const canActivate = guardService.canActivate(requestContext);

		expect(canActivate).toBeTruthy();
	});

	it('should allow when header token is defined and equals request one and whitelisted ip config is defined and equals request', () => {
		const whitelistedIp = '128.0.0.1';
		const headerTokenToLogin = 'game-token';

		const config = getConfig(headerTokenToLogin, whitelistedIp);
		const requestContext = getContext(
			{
				header: 'test-header',
				[loginAuthHeaderKey]: headerTokenToLogin,
			},
			'128.0.0.1',
		);

		const guardService = new InternalLoginAuthGuard(config);

		const canActivate = guardService.canActivate(requestContext);

		expect(canActivate).toBeTruthy();
	});

	it('should not allow when header token is defined and not equals request one and whitelisted ip config is empty', () => {
		const whitelistedIp = '';
		const headerTokenToLogin = 'game-token';

		const config = getConfig(headerTokenToLogin, whitelistedIp);
		const requestContext = getContext(
			{
				header: 'test-header',
				[loginAuthHeaderKey]: 'not-correct-header-token',
			},
			'0.0.0.0',
		);

		const guardService = new InternalLoginAuthGuard(config);

		const canActivate = guardService.canActivate(requestContext);

		expect(canActivate).toBeFalsy();
	});

	it('should not allow when header token is defined and not exists in request and whitelisted ip config is empty', () => {
		const whitelistedIp = '';
		const headerTokenToLogin = 'game-token';

		const config = getConfig(headerTokenToLogin, whitelistedIp);
		const requestContext = getContext(
			{
				header: 'test-header',
			},
			'0.0.0.0',
		);

		const guardService = new InternalLoginAuthGuard(config);

		const canActivate = guardService.canActivate(requestContext);

		expect(canActivate).toBeFalsy();
	});

	it('should not allow when header token is defined and equals request one and whitelisted ip config is defined and not equals request', () => {
		const whitelistedIp = '128.0.0.1';
		const headerTokenToLogin = 'game-token';

		const config = getConfig(headerTokenToLogin, whitelistedIp);
		const requestContext = getContext(
			{
				header: 'test-header',
				[loginAuthHeaderKey]: headerTokenToLogin,
			},
			'128.0.0.2',
		);

		const guardService = new InternalLoginAuthGuard(config);

		const canActivate = guardService.canActivate(requestContext);

		expect(canActivate).toBeFalsy();
	});
});

function getContext(
	headers: Record<string, string>,
	requestId: string,
): ExecutionContext {
	const context = {
		switchToHttp: jest.fn(),
	} as unknown as jest.Mocked<ExecutionContext>;
	const request = {
		headers,
		ip: requestId,
	};

	context.switchToHttp.mockReturnValue({
		getRequest: jest.fn().mockReturnValue(request),
		getResponse: jest.fn(),
		getNext: jest.fn(),
	});

	return context;
}

function getConfig(
	headerTokenToLogin: string,
	whitelistedIp: string,
): ConfigService {
	const configService = {
		get: jest.fn(),
	} as unknown as jest.Mocked<ConfigService>;

	when(configService.get)
		.calledWith(expect.stringMatching('security.headerTokenToLogin'))
		.mockReturnValue(headerTokenToLogin)
		.calledWith(expect.stringMatching('security.whitelistedIp'))
		.mockReturnValue(whitelistedIp);

	return configService;
}
