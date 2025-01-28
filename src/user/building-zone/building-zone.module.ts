import {Module} from '@nestjs/common';

import {BuildingZoneResolver} from './building-zone.resolver';
import {BuildingZoneService} from './building-zone.service';

import {AuthModule} from '@warp-core/auth';
import {CoreConfigModule} from '@warp-core/core/config/core-config.module';
import {DatabaseModule} from '@warp-core/database/database.module';
import {BuildingZoneHandler} from '@warp-core/user/building-zone/exchange/query/building-zone.handler';
import {FirstHabitatCreatedSubscriber} from '@warp-core/user/building-zone/subscriber/first-habitat-created.subscriber';
import {NewHabitatCreatedSubscriber} from '@warp-core/user/building-zone/subscriber/new-habitat-created.subscriber';

@Module({
	providers: [
		BuildingZoneService,
		BuildingZoneResolver,
		NewHabitatCreatedSubscriber,
		FirstHabitatCreatedSubscriber,
		BuildingZoneHandler,
	],
	imports: [DatabaseModule, CoreConfigModule, AuthModule],
	exports: [BuildingZoneService],
})
export class BuildingZoneModule {}
