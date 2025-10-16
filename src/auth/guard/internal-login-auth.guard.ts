import {
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Observable} from 'rxjs';

import {loginAuthHeaderKey} from '@warp-core/auth/constants';

@Injectable()
export class InternalLoginAuthGuard implements CanActivate {
	private readonly logger = new Logger(InternalLoginAuthGuard.name);
	private readonly headerKey = loginAuthHeaderKey.toLowerCase();
	private readonly headerTokenToLogin: string | undefined;
	private readonly whitelistedIp: string | undefined;

	constructor(configService: ConfigService) {
		this.headerTokenToLogin = configService.get('security.headerTokenToLogin');
		this.whitelistedIp = configService.get('security.whitelistedIp');
	}

	public canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest();
		const headers = request.headers;
		const ip = request.ip;

		return this.isHeaderAllowed(headers) && this.isIpAllowed(ip);
	}

	private isHeaderAllowed(headersFromRequest): boolean {
		if (!this.headerTokenToLogin) {
			return true;
		}

		if (this.headerKey in headersFromRequest) {
			if (headersFromRequest[this.headerKey] === this.headerTokenToLogin)
				return true;
		}

		this.logger.warn('Failed to authenticate header');

		return false;
	}

	private isIpAllowed(ipFromRequest): boolean {
		if (!this.whitelistedIp) {
			return true;
		}

		if (this.whitelistedIp === ipFromRequest) {
			return true;
		}

		this.logger.warn('Failed to authenticate ip');

		return false;
	}
}
