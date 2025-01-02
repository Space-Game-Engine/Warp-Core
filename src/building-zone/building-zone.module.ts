import {forwardRef, Module} from '@nestjs/common';

import {BuildingZoneResolver} from './building-zone.resolver';
import {BuildingZoneService} from './building-zone.service';

import {AuthModule} from '@warp-core/auth';
import {BuildingModule} from '@warp-core/building';
import {BuildingQueueModule} from '@warp-core/building-queue';
import {FirstHabitatCreatedSubscriber} from '@warp-core/building-zone/subscriber/first-habitat-created.subscriber';
import {NewHabitatCreatedSubscriber} from '@warp-core/building-zone/subscriber/new-habitat-created.subscriber';
import {CoreConfigModule} from '@warp-core/core/config/core-config.module';
import {DatabaseModule} from '@warp-core/database';
import {HabitatModule} from '@warp-core/habitat';

@Module({
	providers: [
		BuildingZoneService,
		BuildingZoneResolver,
		NewHabitatCreatedSubscriber,
		FirstHabitatCreatedSubscriber,
	],
	imports: [
		DatabaseModule,
		CoreConfigModule,
		BuildingModule,
		forwardRef(() => BuildingQueueModule),
		forwardRef(() => HabitatModule),
		AuthModule,
	],
	exports: [BuildingZoneService],
})
export class BuildingZoneModule {}
