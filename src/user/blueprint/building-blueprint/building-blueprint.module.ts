import {Module} from '@nestjs/common';

import {AuthModule} from '@warp-core/auth';
import {DatabaseModule} from '@warp-core/database/database.module';
import {BuildingBlueprintResolver} from '@warp-core/user/blueprint/building-blueprint/building-blueprint.resolver';
import {BuildingBlueprintQuerySubscriber} from '@warp-core/user/blueprint/building-blueprint/exchange/subscriber/building-blueprint-query.subscriber';
import {BuildingBlueprintPlayerService} from '@warp-core/user/blueprint/building-blueprint/service/building-blueprint-player.service';

@Module({
	providers: [
		BuildingBlueprintPlayerService,
		BuildingBlueprintResolver,
		BuildingBlueprintQuerySubscriber,
	],
	imports: [DatabaseModule, AuthModule],
})
export class BuildingBlueprintModule {}
