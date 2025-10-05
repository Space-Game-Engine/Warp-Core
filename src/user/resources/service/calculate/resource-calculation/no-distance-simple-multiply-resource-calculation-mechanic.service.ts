import {Injectable} from '@nestjs/common';

import {AddMechanic} from '@warp-core/core/utils/mechanics';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {CalculationMechanic} from '@warp-core/user/resources/service/calculate/resource-calculation/calculation-mechanic.interface';

@Injectable()
@AddMechanic(CalculationMechanic, 'no-distance-simple-multiply')
export class NoDistanceSimpleMultiplyResourceCalculationMechanicService
	implements CalculationMechanic
{
	constructor(
		private readonly buildingZoneRepository: BuildingZoneRepository,
	) {}

	public async getProductionRate(
		habitatResource: HabitatResourceModel,
	): Promise<number> {
		const resource = await habitatResource.resource;
		const habitat = await habitatResource.habitat;

		const buildingZones =
			await this.buildingZoneRepository.getBuildingZoneProducersForSingleResource(
				habitat,
				resource,
			);

		return this.calculateProductionRateForResource(
			habitatResource,
			buildingZones,
		);
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

	private async calculateProductionRateForResource(
		habitatResource: HabitatResourceModel,
		buildingZones: BuildingZoneModel[],
	): Promise<number> {
		let productionRate = 0;
		for (const singleBuildingZone of buildingZones) {
			const currentProductionRate =
				await this.getProductionRateForSingleBuildingZone(
					habitatResource,
					singleBuildingZone,
				);

			productionRate += currentProductionRate;
		}

		return productionRate;
	}

	private async getProductionRateForSingleBuildingZone(
		habitatResource: HabitatResourceModel,
		buildingZone: BuildingZoneModel,
	): Promise<number> {
		const building = await buildingZone.building;

		if (!building) {
			return 0;
		}

		const buildingDetailsAtCertainLevel =
			await building.buildingDetailsAtCertainLevel;
		const productionRateModels = await buildingDetailsAtCertainLevel.find(
			buildingDetails => buildingDetails.level === buildingZone.level,
		)?.productionRate;

		if (!productionRateModels || productionRateModels.length === 0) {
			return 0;
		}

		const productionRateValue = productionRateModels.find(async rateModel => {
			const rateModelResource = await rateModel.resource;

			return rateModelResource.id === habitatResource.resourceId;
		})?.productionRate;

		return productionRateValue ?? 0;
	}
}
