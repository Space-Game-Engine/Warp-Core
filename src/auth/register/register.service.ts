import {Injectable, InternalServerErrorException} from '@nestjs/common';

import {RegisterInterface} from './register.interface';

import {LoginParameters} from '@warp-core/auth/login/login-parameters.model';
import {InternalEmitterError} from '@warp-core/core/utils/internal-exchange';
import {HabitatEmitter} from '@warp-core/user/habitat';

@Injectable()
export class RegisterService implements RegisterInterface {
	constructor(private readonly habitatEmitter: HabitatEmitter) {}

	public async registerUser(userId: number): Promise<LoginParameters> {
		const {data: habitat, error} =
			await this.habitatEmitter.createFirstUserHabitat({userId});

		if (error) {
			throw new InternalEmitterError(error);
		}

		if (!habitat) {
			throw new InternalServerErrorException(
				'No habitat found, please try again.',
			);
		}

		return {
			userId,
			habitatId: habitat.id,
		} as LoginParameters;
	}
}
