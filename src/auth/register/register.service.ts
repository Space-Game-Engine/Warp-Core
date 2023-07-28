import {Injectable} from '@nestjs/common';
import {EventEmitter2} from '@nestjs/event-emitter';
import {LoginParameters} from '@warp-core/auth/login/login-parameters.model';
import {RegisterUserEvent} from './register-user.event';
import {RegisterInterface} from './register.interface';

@Injectable()
export class RegisterService implements RegisterInterface {
	constructor(private readonly eventEmitter: EventEmitter2) {}

	async registerUser(userId: number): Promise<LoginParameters> {
		const registerEvent = new RegisterUserEvent(userId);

		await this.eventEmitter.emitAsync('user.create_new', registerEvent);

		return {
			userId,
			habitatId: registerEvent.getHabitatId(),
		} as LoginParameters;
	}
}
