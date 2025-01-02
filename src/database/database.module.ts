import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {EntityClassOrSchema} from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import {
	BuildingDetailsAtCertainLevelModel,
	BuildingModel,
	BuildingProductionRateModel,
	BuildingQueueElementModel,
	BuildingRequirementsModel,
	BuildingZoneModel,
	HabitatModel,
	HabitatResourceModel,
	ResourceModel,
	WarehouseDetailsModel,
} from '@warp-core/database/model';
import {InstallationDetailsModel} from '@warp-core/database/model/installation-details.model';
import {
	BuildingQueueRepository,
	BuildingRepository,
	BuildingZoneRepository,
	HabitatRepository,
	HabitatResourceRepository,
	ResourceRepository,
} from '@warp-core/database/repository';
import {InstallationDetailsRepository} from '@warp-core/database/repository/installation-details.repository';
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
