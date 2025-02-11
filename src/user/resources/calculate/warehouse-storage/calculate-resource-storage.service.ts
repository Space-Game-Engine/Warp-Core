import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {ResourceModel} from '@warp-core/database/model/resource.model';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';

@Injectable()
export class CalculateResourceStorageService {
	constructor(
		private readonly buildingZoneRepository: BuildingZoneRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	public async calculateStorage(resource: ResourceModel): Promise<number> {
		let storagePerResource = 0;
		const warehouses =
			await this.buildingZoneRepository.getWarehouseForResourceAndHabitat(
				resource,
				this.habitatModel.id,
			);

		for (const warehouse of warehouses) {
			storagePerResource += warehouse.amount;
		}

		return storagePerResource;
	}
}
