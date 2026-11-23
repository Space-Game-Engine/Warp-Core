import {Module} from '@nestjs/common';

import {BlueprintModule} from '@warp-core/user/blueprint/blueprint.module';
import {BuildingZoneModule} from '@warp-core/user/building-zone/building-zone.module';
import {HabitatModule} from '@warp-core/user/habitat/habitat.module';
import {QueueModule} from '@warp-core/user/queue/queue.module';
import {ResourcesModule} from '@warp-core/user/resources/resources.module';
import {TechnologyModule} from '@warp-core/user/technology/technology.module';
import {UnitInstanceModule} from '@warp-core/user/unit-instance/unit-instance.module';

@Module({
	imports: [
		BlueprintModule,
		BuildingZoneModule,
		HabitatModule,
		QueueModule,
		ResourcesModule,
		TechnologyModule,
		UnitInstanceModule,
	],
})
export class UserModule {}
