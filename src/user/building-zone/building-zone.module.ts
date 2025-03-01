import {Module} from '@nestjs/common';

import {BuildingZoneResolver} from './building-zone.resolver';
import {BuildingZoneService} from './service/building-zone.service';

import {AuthModule} from '@warp-core/auth';
import {CoreConfigModule} from '@warp-core/core/config/core-config.module';
import {DatabaseModule} from '@warp-core/database/database.module';
import {BuildingZoneSubscriber} from '@warp-core/user/building-zone/exchange/subscriber/building-zone.subscriber';
import {NewHabitatSubscriber} from '@warp-core/user/building-zone/exchange/subscriber/new-habitat.subscriber';
import {FirstHabitatCreatedService} from '@warp-core/user/building-zone/service/first-habitat-created.service';
import {NewHabitatCreatedService} from '@warp-core/user/building-zone/service/new-habitat-created.service';

@Module({
	providers: [
		BuildingZoneService,
		BuildingZoneResolver,
		NewHabitatCreatedService,
		FirstHabitatCreatedService,
		BuildingZoneSubscriber,
		NewHabitatSubscriber,
	],
	imports: [DatabaseModule, CoreConfigModule, AuthModule],
	exports: [BuildingZoneService],
})
export class BuildingZoneModule {}
