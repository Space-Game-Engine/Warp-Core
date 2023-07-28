import {Injectable} from '@nestjs/common';
import {AuthorizedHabitatModel} from '@warp-core/auth';
import {HabitatModel, HabitatRepository} from '@warp-core/database';

@Injectable()
export class HabitatService {
	constructor(
		private readonly habitatRepository: HabitatRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	async getCurrentHabitat(): Promise<HabitatModel> {
		return this.habitatModel;
	}

	async getHabitatsForLoggedIn(): Promise<HabitatModel[]> {
		return this.habitatRepository.getHabitatsByUserId(this.habitatModel.userId);
	}

	async getHabitatById(habitatId: number): Promise<HabitatModel | null> {
		return this.habitatRepository.getHabitatById(habitatId);
	}
}
