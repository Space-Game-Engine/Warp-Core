import {Module} from '@nestjs/common';
import {EventEmitterModule} from '@nestjs/event-emitter';

import {AuthModule} from '@warp-core/auth';
import {DatabaseModule} from '@warp-core/database/database.module';
import {HabitatResolver} from '@warp-core/user/habitat/habitat.resolver';
import {HabitatService} from '@warp-core/user/habitat/habitat.service';
import {CreateNewHabitatService} from '@warp-core/user/habitat/subscriber/create/create-new-habitat.service';
import {ResourcesQueryEmitter} from '@warp-core/user/resources';

@Module({
	providers: [
		ResourcesQueryEmitter,
		HabitatService,
		HabitatResolver,
		CreateNewHabitatService,
	],
	imports: [EventEmitterModule, DatabaseModule, AuthModule],
})
export class HabitatModule {}
