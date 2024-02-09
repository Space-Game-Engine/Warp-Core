import {Module} from '@nestjs/common';
import {DatabaseModule} from '@warp-core/database';
import {BuildingResolver} from './building.resolver';
import {BuildingService} from './building.service';
import {BuildingInstallService} from '@warp-core/building/install/building-install.service';
import {AddInstallService} from '@warp-core/core/install';

@Module({
	providers: [
		BuildingService,
		BuildingResolver,
		BuildingInstallService
	],
	imports: [DatabaseModule],
	exports: [
		BuildingService,
		BuildingInstallService
	],
})
@AddInstallService(BuildingInstallService)
export class BuildingModule {}
