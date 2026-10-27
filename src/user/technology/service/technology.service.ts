import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';

@Injectable()
export class TechnologyService {
	constructor(
		private readonly habitatResearchNodeRepository: HabitatResearchNodeRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	public getTechnologiesForLoggedIn(): Promise<HabitatResearchNodeModel[]> {
		return this.habitatResearchNodeRepository.getAllForHabitat(
			this.habitatModel.id,
		);
	}
}
