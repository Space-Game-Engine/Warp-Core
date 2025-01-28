import {Injectable} from '@nestjs/common';
import {EventEmitter2, OnEvent} from '@nestjs/event-emitter';

import {RegisterUserEvent} from '@warp-core/auth';
import {HabitatModel, HabitatRepository} from '@warp-core/database';
import {HabitatCreatedEvent} from '@warp-core/user/habitat/event/habitat-created.event';
import {NewHabitatInput} from '@warp-core/user/habitat/input/new-habitat.input';

@Injectable()
export class CreateNewHabitatService {
	constructor(
		private readonly habitatRepository: HabitatRepository,
		private readonly eventEmitter: EventEmitter2,
	) {}

	@OnEvent('user.create_new')
	public async createHabitatOnUserRegistration(
		payload: RegisterUserEvent,
	): Promise<void> {
		const currentHabitats = await this.habitatRepository.getHabitatsByUserId(
			payload.getUserId(),
		);

		if (currentHabitats.length > 0) {
			payload.setHabitatId(currentHabitats.pop()!.id);

			return;
		}

		await this.habitatRepository.startTransaction();

		try {
			const newHabitat = await this.createNewHabitat({
				userId: payload.getUserId(),
				isMain: true,
				name: 'New habitat',
			});

			payload.setHabitatId(newHabitat.id);

			await this.eventEmitter.emitAsync(
				'habitat.created.after_registration',
				new HabitatCreatedEvent(newHabitat),
			);

			await this.habitatRepository.commitTransaction();
		} catch (e) {
			await this.habitatRepository.rollbackTransaction();

			throw e;
		}
	}

	public async createNewHabitat(
		newHabitatData: NewHabitatInput,
	): Promise<HabitatModel> {
		const newHabitat = this.habitatRepository.create(newHabitatData);
		await this.habitatRepository.save(newHabitat);

		await this.eventEmitter.emitAsync(
			'habitat.created.after_save',
			new HabitatCreatedEvent(newHabitat),
		);

		return newHabitat;
	}
}
