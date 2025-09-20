import {Injectable} from '@nestjs/common';

import {AddMechanic} from '@warp-core/core/utils/mechanics';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {ResourceModel} from '@warp-core/database/model/resource.model';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {WarehouseStorageCalculationMechanic} from '@warp-core/user/resources/service/calculate/warehouse-storage/warehouse-storage-calculation-mechanic.interface';

@Injectable()
@AddMechanic(WarehouseStorageCalculationMechanic, 'enabled_base')
export class BaseResourceStorageService
	implements WarehouseStorageCalculationMechanic
{
	constructor(
		private readonly buildingZoneRepository: BuildingZoneRepository,
	) {}

	public async calculateStorage(
		resource: ResourceModel,
		habitat: HabitatModel,
	): Promise<number> {
		let storagePerResource = 0;
		const warehouses =
			await this.buildingZoneRepository.getWarehouseForResourceAndHabitat(
				resource,
				habitat.id,
			);

		for (const warehouse of warehouses) {
			storagePerResource += warehouse.amount;
		}

		return storagePerResource;
	}
}
