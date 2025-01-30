import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {HabitatRepository} from '@warp-core/database/repository/habitat.repository';

@Injectable()
export class HabitatService {
	constructor(
		private readonly habitatRepository: HabitatRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	public async getCurrentHabitat(): Promise<HabitatModel> {
		return this.habitatModel;
	}

	public async getHabitatsForLoggedIn(): Promise<HabitatModel[]> {
		return this.habitatRepository.getHabitatsByUserId(this.habitatModel.userId);
	}

	public async getHabitatById(habitatId: number): Promise<HabitatModel | null> {
		return this.habitatRepository.getHabitatById(habitatId);
	}
}
