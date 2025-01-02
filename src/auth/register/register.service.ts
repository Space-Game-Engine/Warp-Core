import {Injectable} from '@nestjs/common';
import {EventEmitter2} from '@nestjs/event-emitter';

import {RegisterInterface} from './register.interface';

import {RegisterUserEvent} from '@warp-core/auth';
import {LoginParameters} from '@warp-core/auth/login/login-parameters.model';

@Injectable()
export class RegisterService implements RegisterInterface {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	public async registerUser(userId: number): Promise<LoginParameters> {
		const registerEvent = new RegisterUserEvent(userId);

		await this.eventEmitter.emitAsync('user.create_new', registerEvent);

		return {
			userId,
			habitatId: registerEvent.getHabitatId(),
		} as LoginParameters;
	}
}
