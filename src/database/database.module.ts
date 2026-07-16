import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {EntityClassOrSchema} from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import {BuildingDetailsAtCertainLevelModel} from '@warp-core/database/model/building/building-details-at-certain-level.model';
import {BuildingProductionRateModel} from '@warp-core/database/model/building/building-production-rate.model';
import {BuildingModel} from '@warp-core/database/model/building/building.model';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {InstallationDetailsModel} from '@warp-core/database/model/installation-details.model';
import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';
import {RequirementsPerLevelModel} from '@warp-core/database/model/level-details/requirements-per-level.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchNodeDetailsAtCertainLevelModel} from '@warp-core/database/model/research-node/research-node-details-at-certain-level.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {HabitatResourceModel} from '@warp-core/database/model/resource/habitat-resource.model';
import {ResourceModel} from '@warp-core/database/model/resource/resource.model';
import {WarehouseDetailsModel} from '@warp-core/database/model/warehouse-details.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {BuildingRepository} from '@warp-core/database/repository/building.repository';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {HabitatRepository} from '@warp-core/database/repository/habitat.repository';
import {InstallationDetailsRepository} from '@warp-core/database/repository/installation-details.repository';
import {ResourceRepository} from '@warp-core/database/repository/resource.repository';
import {TransactionManagerService} from '@warp-core/database/transaction-manager.service';

@Module({
	providers: [
		BuildingRepository,
		BuildingZoneRepository,
		BuildingQueueRepository,
		HabitatRepository,
		HabitatResourceRepository,
		ResourceRepository,
		InstallationDetailsRepository,
		TransactionManagerService,
	],
	imports: [
		forwardRef(() => TypeOrmModule.forFeature(DatabaseModule.entities())),
	],
	exports: [
		BuildingRepository,
		BuildingZoneRepository,
		BuildingQueueRepository,
		HabitatRepository,
		HabitatResourceRepository,
		ResourceRepository,
		InstallationDetailsRepository,
	],
})
export class DatabaseModule {
	public static entities(): EntityClassOrSchema[] {
		return [
			BuildingModel,
			BuildingDetailsAtCertainLevelModel,
			BuildingProductionRateModel,
			DetailsAtCertainLevelModel,
			HabitatResearchNodeModel,
			ResearchNodeModel,
			RequirementsPerLevelModel,
			DetailsAtCertainLevelModel,
			ResearchNodeDetailsAtCertainLevelModel,
			HabitatResourceModel,
			ResourceModel,
			BuildingQueueElementModel,
			BuildingZoneModel,
			HabitatModel,
			InstallationDetailsModel,
			QueueElementCostModel,
			WarehouseDetailsModel,
		];
	}
}
