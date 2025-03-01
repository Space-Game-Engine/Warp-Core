import {Injectable} from '@nestjs/common';

import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {HabitatRepository} from '@warp-core/database/repository/habitat.repository';
import {CreateFirstUserHabitatInput} from '@warp-core/user/habitat/exchange';
import {NewHabitatEmitter} from '@warp-core/user/habitat/exchange/emit/new-habitat.emitter';
import {NewHabitatInput} from '@warp-core/user/habitat/input/new-habitat.input';

@Injectable()
export class CreateNewHabitatService {
	constructor(
		private readonly habitatRepository: HabitatRepository,
		private readonly newHabitatEmitter: NewHabitatEmitter,
	) {}

	public async createHabitatOnUserRegistration(
		payload: CreateFirstUserHabitatInput,
	): Promise<HabitatModel> {
		const {userId} = payload;
		const currentHabitats =
			await this.habitatRepository.getHabitatsByUserId(userId);

		if (currentHabitats.length > 0) {
			return currentHabitats.pop()!;
		}

		await this.habitatRepository.startTransaction();

		try {
			const newHabitat = await this.createNewHabitat({
				userId,
				isMain: true,
				name: 'New habitat',
			});
			await this.newHabitatEmitter.newHabitatAfterRegistration({
				habitat: newHabitat,
			});

			await this.habitatRepository.commitTransaction();

			return newHabitat;
		} catch (e) {
			await this.habitatRepository.rollbackTransaction();

			throw e;
		}
	}

	public async createNewHabitat(
		newHabitatData: NewHabitatInput,
	): Promise<HabitatModel> {
		const newHabitat = this.habitatRepository.create(newHabitatData);
		await this.newHabitatEmitter.newHabitatCreatedBeforeSave({
			habitat: newHabitat,
		});
		await this.habitatRepository.save(newHabitat);

		await this.newHabitatEmitter.newHabitatCreatedAfterSave({
			habitat: newHabitat,
		});

		return newHabitat;
	}
}
