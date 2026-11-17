import {Injectable} from '@nestjs/common';

import {isStorageLinkedToResource} from '@warp-core/core/utils';
import {InternalEmitterError} from '@warp-core/core/utils/internal-exchange';
import {AddMechanic} from '@warp-core/core/utils/mechanics';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {ResourceModel} from '@warp-core/database/model/resource/resource.model';
import {BuildingZoneEmitter} from '@warp-core/user/building-zone';
import {WarehouseStorageCalculationMechanic} from '@warp-core/user/resources/service/calculate/warehouse-storage/warehouse-storage-calculation-mechanic.interface';

@Injectable()
@AddMechanic(WarehouseStorageCalculationMechanic, 'base-resource-summary')
export class BaseResourceStorageService implements WarehouseStorageCalculationMechanic {
	constructor(private readonly buildingZoneEmitter: BuildingZoneEmitter) {}

	public async calculateStorage(
		resource: ResourceModel,
		habitat: HabitatModel,
	): Promise<number> {
		const {data: zonesCapabilities, error} =
			await this.buildingZoneEmitter.getCalculatedCapabilitiesForHabitat({
				habitatId: habitat.id,
			});

		if (error) {
			throw new InternalEmitterError(error.message);
		}

		let storagePerResource = 0;

		for (const {capabilities} of zonesCapabilities ?? []) {
			for (const storage of capabilities.storage) {
				if (isStorageLinkedToResource(storage, resource)) {
					storagePerResource += storage.amount;
				}
			}
		}

		return storagePerResource;
	}
}
