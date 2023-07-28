import {
	BuildingZoneRepository,
	ResourceModel,
} from '@warp-core/database';
import {AuthorizedHabitatModel} from '@warp-core/auth';
import {Injectable} from '@nestjs/common';

@Injectable()
export class CalculateResourceStorageService {
	constructor(
		private readonly buildingZoneRepository: BuildingZoneRepository,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {}

	async calculateStorage(resource: ResourceModel): Promise<number> {
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
