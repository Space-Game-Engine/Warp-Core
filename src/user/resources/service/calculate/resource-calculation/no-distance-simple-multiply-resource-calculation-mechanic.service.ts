import {Injectable} from '@nestjs/common';

import {InternalEmitterError} from '@warp-core/core/utils/internal-exchange';
import {AddMechanic} from '@warp-core/core/utils/mechanics';
import {HabitatResourceModel} from '@warp-core/database/model/resource/habitat-resource.model';
import {BuildingZoneEmitter} from '@warp-core/user/building-zone';
import {CalculationMechanic} from '@warp-core/user/resources/service/calculate/resource-calculation/calculation-mechanic.interface';

@Injectable()
@AddMechanic(CalculationMechanic, 'no-distance-simple-multiply')
export class NoDistanceSimpleMultiplyResourceCalculationMechanicService implements CalculationMechanic {
	constructor(private readonly buildingZoneEmitter: BuildingZoneEmitter) {}

	public async getProductionRate(
		habitatResource: HabitatResourceModel,
	): Promise<number> {
		const {data: zonesCapabilities, error} =
			await this.buildingZoneEmitter.getCalculatedCapabilitiesForHabitat({
				habitatId: habitatResource.habitatId,
			});

		if (error) {
			throw new InternalEmitterError(error.message);
		}

		let productionRate = 0;

		for (const {capabilities} of zonesCapabilities ?? []) {
			for (const production of capabilities.production) {
				if (production.resourceId === habitatResource.resourceId) {
					productionRate += production.amountPerSecond;
				}
			}
		}

		return productionRate;
	}

	public async calculateCurrentResourceValue(
		habitatResource: HabitatResourceModel,
		secondsToCalculateResources: number,
	): Promise<number> {
		const productionRate = await this.getProductionRate(habitatResource);
		const lastlyCalculatedAmount = habitatResource.currentAmount;

		const producedResourcesInTime =
			productionRate * secondsToCalculateResources;

		return lastlyCalculatedAmount + producedResourcesInTime;
	}
}
