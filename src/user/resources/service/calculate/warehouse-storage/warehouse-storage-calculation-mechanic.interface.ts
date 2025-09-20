import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {ResourceModel} from '@warp-core/database/model/resource.model';

export abstract class WarehouseStorageCalculationMechanic {
	/**
	 * Calculate warehouse storage for the whole habitat
	 */
	public abstract calculateStorage(
		resource: ResourceModel,
		habitat: HabitatModel,
	): Promise<number>;
}
