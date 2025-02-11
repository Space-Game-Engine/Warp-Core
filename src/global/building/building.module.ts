import {Module} from '@nestjs/common';

import {BuildingResolver} from './building.resolver';
import {BuildingService} from './building.service';

import {AddInstallService} from '@warp-core/core/install';
import {DatabaseModule} from '@warp-core/database/database.module';
import {BuildingQueryHandler} from '@warp-core/global/building/exchange/query/building-query.handler';
import {BuildingInstallService} from '@warp-core/global/building/install/building-install.service';

@Module({
	providers: [
		BuildingService,
		BuildingResolver,
		BuildingInstallService,
		BuildingQueryHandler,
	],
	imports: [DatabaseModule],
	exports: [BuildingService, BuildingInstallService],
})
@AddInstallService(BuildingInstallService)
export class BuildingModule {}
