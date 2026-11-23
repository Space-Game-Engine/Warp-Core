import {Module} from '@nestjs/common';

import {AuthModule} from '@warp-core/auth';
import {SumCapabilitiesModule} from '@warp-core/core/utils/capabilities/sum-capabilities.module';
import {DatabaseModule} from '@warp-core/database/database.module';
import {UnitInstanceQuerySubscriber} from '@warp-core/user/unit-instance/exchange/subscriber/unit-instance-query.subscriber';
import {CalculateUnitInstanceCapabilitiesService} from '@warp-core/user/unit-instance/service/calculate-unit-instance-capabilities.service';
import {UnitBlueprintPlayerService} from '@warp-core/user/unit-instance/service/unit-blueprint-player.service';
import {UnitInstanceService} from '@warp-core/user/unit-instance/service/unit-instance.service';
import {UnitInstanceResolver} from '@warp-core/user/unit-instance/unit-instance.resolver';

@Module({
	providers: [
		UnitBlueprintPlayerService,
		UnitInstanceService,
		CalculateUnitInstanceCapabilitiesService,
		UnitInstanceResolver,
		UnitInstanceQuerySubscriber,
	],
	imports: [DatabaseModule, AuthModule, SumCapabilitiesModule],
})
export class UnitInstanceModule {}
