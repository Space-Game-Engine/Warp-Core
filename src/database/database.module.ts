import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {EntityClassOrSchema} from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import {BuildingDetailsAtCertainLevelModel} from '@warp-core/database/model/building-details-at-certain-level.model';
import {BuildingProductionRateModel} from '@warp-core/database/model/building-production-rate.model';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingRequirementsModel} from '@warp-core/database/model/building-requirements.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {InstallationDetailsModel} from '@warp-core/database/model/installation-details.model';
import {ResourceModel} from '@warp-core/database/model/resource.model';
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
			HabitatModel,
			BuildingZoneModel,
			BuildingQueueElementModel,
			ResourceModel,
			HabitatResourceModel,
			BuildingProductionRateModel,
			BuildingRequirementsModel,
			WarehouseDetailsModel,
			InstallationDetailsModel,
		];
	}
}
