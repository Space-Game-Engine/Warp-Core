import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtService as NestJwtService} from '@nestjs/jwt';
import {Request} from 'express';
import {ExtractJwt} from 'passport-jwt';

import {PayloadInterface} from '@warp-core/auth/interface/payload.interface';
import {AccessToken} from '@warp-core/auth/login/access-token.model';

@Injectable()
export class JwtService {
	constructor(
		private readonly nestJwtService: NestJwtService,
		private readonly configService: ConfigService,
	) {}

	public verifyAsync(token: string): Promise<unknown> {
		return this.nestJwtService.verifyAsync(token, {
			secret: this.configService.get('jwt.secret'),
		});
	}

	public sign(payload: PayloadInterface): AccessToken {
		return {
			access_token: this.nestJwtService.sign(payload),
		};
	}

	public decode(request: Request): PayloadInterface | undefined {
		const extractJwt = ExtractJwt.fromAuthHeaderAsBearerToken();

		return this.nestJwtService.decode(extractJwt(request) ?? '');
	}
}
