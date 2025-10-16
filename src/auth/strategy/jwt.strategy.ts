import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';

import {AuthModelInterface} from '@warp-core/auth/interface/auth-model.interface';
import {PayloadInterface} from '@warp-core/auth/interface/payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(configService: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: configService.get('jwt.ignoreExpiration'),
			secretOrKey: configService.get('jwt.secret') ?? '',
		});
	}

	public validate(payload: PayloadInterface): AuthModelInterface {
		return payload.dbModel;
	}
}
