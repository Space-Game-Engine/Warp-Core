import {Module} from '@nestjs/common';

import {BuildingZoneModule} from '@warp-core/user/building-zone/building-zone.module';
import {HabitatModule} from '@warp-core/user/habitat';
import {QueueModule} from '@warp-core/user/queue/queue.module';
import {ResourcesModule} from '@warp-core/user/resources/resources.module';

@Module({
	imports: [BuildingZoneModule, HabitatModule, QueueModule, ResourcesModule],
})
export class UserModule {}
