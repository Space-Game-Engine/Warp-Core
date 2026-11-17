import {forwardRef, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {EntityClassOrSchema} from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {BuildingBlueprintPlayerModel} from '@warp-core/database/model/building/building-blueprint-player.model';
import {BuildingDetailsAtCertainLevelModel} from '@warp-core/database/model/building/building-details-at-certain-level.model';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {ProductionCapabilityModel} from '@warp-core/database/model/capability/production-capability.model';
import {StorageCapabilityModel} from '@warp-core/database/model/capability/storage-capability.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {InstallationDetailsModel} from '@warp-core/database/model/installation-details.model';
import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';
import {RequirementsPerLevelModel} from '@warp-core/database/model/level-details/requirements-per-level.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {HabitatResearchNodeModel} from '@warp-core/database/model/research-node/habitat-research-node.model';
import {ResearchNodeDetailsAtCertainLevelModel} from '@warp-core/database/model/research-node/research-node-details-at-certain-level.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {HabitatResourceModel} from '@warp-core/database/model/resource/habitat-resource.model';
import {ResourceModel} from '@warp-core/database/model/resource/resource.model';
import {BuildingBlueprintGlobalRepository} from '@warp-core/database/repository/building-blueprint-global.repository';
import {BuildingBlueprintPlayerRepository} from '@warp-core/database/repository/building-blueprint-player.repository';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {HabitatResearchNodeRepository} from '@warp-core/database/repository/habitat-research-node.repository';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {HabitatRepository} from '@warp-core/database/repository/habitat.repository';
import {InstallationDetailsRepository} from '@warp-core/database/repository/installation-details.repository';
import {ResearchNodeRepository} from '@warp-core/database/repository/research-node.repository';
import {ResearchQueueRepository} from '@warp-core/database/repository/research-queue.repository';
import {ResourceRepository} from '@warp-core/database/repository/resource.repository';
import {TransactionManagerService} from '@warp-core/database/transaction-manager.service';

@Module({
	providers: [
		BuildingBlueprintGlobalRepository,
		BuildingBlueprintPlayerRepository,
		BuildingZoneRepository,
		BuildingQueueRepository,
		HabitatRepository,
		HabitatResearchNodeRepository,
		HabitatResourceRepository,
		ResearchNodeRepository,
		ResearchQueueRepository,
		ResourceRepository,
		InstallationDetailsRepository,
		TransactionManagerService,
	],
	imports: [
		forwardRef(() => TypeOrmModule.forFeature(DatabaseModule.entities())),
	],
	exports: [
		BuildingBlueprintGlobalRepository,
		BuildingBlueprintPlayerRepository,
		BuildingZoneRepository,
		BuildingQueueRepository,
		HabitatRepository,
		HabitatResearchNodeRepository,
		HabitatResourceRepository,
		ResearchNodeRepository,
		ResearchQueueRepository,
		ResourceRepository,
		InstallationDetailsRepository,
	],
})
export class DatabaseModule {
	public static entities(): EntityClassOrSchema[] {
		return [
			BuildingBlueprintGlobalModel,
			BuildingBlueprintPlayerModel,
			BuildingDetailsAtCertainLevelModel,
			CapabilitiesModel,
			ProductionCapabilityModel,
			StorageCapabilityModel,
			DetailsAtCertainLevelModel,
			HabitatResearchNodeModel,
			ResearchNodeModel,
			RequirementsPerLevelModel,
			ResearchNodeDetailsAtCertainLevelModel,
			HabitatResourceModel,
			ResourceModel,
			BuildingQueueElementModel,
			ResearchQueueElementModel,
			BuildingZoneModel,
			HabitatModel,
			InstallationDetailsModel,
			QueueElementCostModel,
		];
	}
}
