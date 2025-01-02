import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';

import {AccessToken} from './access-token.model';
import {LoginInterface} from './login.interface';

import {PayloadInterface} from '@warp-core/auth/interface/payload.interface';
import {AuthorizedHabitatModel} from '@warp-core/auth/payload/model/habitat.model';

@Injectable()
export class LoginByHabitatService implements LoginInterface {
	constructor(private jwtService: JwtService) {}

	public async login(habitat: AuthorizedHabitatModel): Promise<AccessToken> {
		const payload = {
			dbModel: habitat,
			sub: habitat.userId,
			currentHabitatId: habitat.id,
		} as PayloadInterface;

		return {
			access_token: `Bearer ${this.jwtService.sign(payload)}`,
		} as AccessToken;
	}
}
