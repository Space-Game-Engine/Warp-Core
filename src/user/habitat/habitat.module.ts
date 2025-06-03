import {Module} from '@nestjs/common';

import {AuthModule} from '@warp-core/auth';
import {DatabaseModule} from '@warp-core/database/database.module';
import {NewHabitatEmitter} from '@warp-core/user/habitat/exchange/emit/new-habitat.emitter';
import {NewHabitatSubscriber} from '@warp-core/user/habitat/exchange/subscriber/new-habitat.subscriber';
import {HabitatResolver} from '@warp-core/user/habitat/habitat.resolver';
import {CreateNewHabitatService} from '@warp-core/user/habitat/service/create-new-habitat.service';
import {HabitatService} from '@warp-core/user/habitat/service/habitat.service';
import {ResourcesQueryEmitter} from '@warp-core/user/resources';

@Module({
	providers: [
		NewHabitatEmitter,
		ResourcesQueryEmitter,
		HabitatService,
		HabitatResolver,
		CreateNewHabitatService,
		NewHabitatSubscriber,
	],
	imports: [DatabaseModule, AuthModule],
})
export class HabitatModule {}
