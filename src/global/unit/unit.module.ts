import {Module} from '@nestjs/common';

import {AddInstallService} from '@warp-core/core/install';
import {DatabaseModule} from '@warp-core/database/database.module';
import {UnitQuerySubscriber} from '@warp-core/global/unit/exchange/subscriber/unit-query.subscriber';
import {UnitInstallService} from '@warp-core/global/unit/install/unit-install.service';
import {UnitResolver} from '@warp-core/global/unit/unit.resolver';
import {UnitService} from '@warp-core/global/unit/unit.service';

@Module({
	providers: [
		UnitService,
		UnitResolver,
		UnitInstallService,
		UnitQuerySubscriber,
	],
	imports: [DatabaseModule],
	exports: [UnitService, UnitInstallService],
})
@AddInstallService(UnitInstallService)
export class UnitModule {}
