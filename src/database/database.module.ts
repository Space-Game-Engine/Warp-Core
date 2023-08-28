import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
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
import {
	BuildingQueueRepository,
	BuildingRepository,
	BuildingZoneRepository,
	HabitatRepository,
	HabitatResourceRepository,
	ResourceRepository,
} from '@warp-core/database/repository';
import {TransactionManagerService} from '@warp-core/database/transaction-manager.service';

@Module({
	providers: [
		BuildingRepository,
		BuildingZoneRepository,
		BuildingQueueRepository,
		HabitatRepository,
		HabitatResourceRepository,
		ResourceRepository,
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
	],
})
export class DatabaseModule {
	static entities() {
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
		];
	}
}
