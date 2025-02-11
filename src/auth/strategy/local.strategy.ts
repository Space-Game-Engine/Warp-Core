import {Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-local';

import {AuthModelInterface} from '@warp-core/auth/interface/auth-model.interface';
import {ValidatorInterface} from '@warp-core/auth/strategy/validator/validator.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject('VALIDATOR_SERVICE')
		private readonly validatorService: ValidatorInterface,
	) {
		super({
			usernameField: 'userId',
			passwordField: 'habitatId',
		});
	}

	public async validate(
		userId: number,
		habitatId: number,
	): Promise<AuthModelInterface> {
		const authModel = await this.validatorService.validate(userId, habitatId);

		if (authModel === null) {
			throw new UnauthorizedException();
		}

		return authModel;
	}
}
