import {Injectable} from '@nestjs/common';

import {ValidatorInterface} from './validator.interface';

import {AuthModelInterface} from '@warp-core/auth/interface/auth-model.interface';
import {HabitatRepository} from '@warp-core/database/repository/habitat.repository';

@Injectable()
export class HabitatValidatorService implements ValidatorInterface {
	constructor(private readonly habitatRepository: HabitatRepository) {}

	public async validate(
		userId: number,
		habitatId: number,
	): Promise<AuthModelInterface | null> {
		return await this.habitatRepository.findOne({
			where: {
				id: habitatId,
				userId: userId,
			},
		});
	}
}
