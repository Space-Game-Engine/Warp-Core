import {Module} from '@nestjs/common';

import {BuildingModule} from '@warp-core/global/building/building.module';
import {ResearchNodeModule} from '@warp-core/global/research-node/research-node.module';
import {UnitModule} from '@warp-core/global/unit/unit.module';

@Module({
	imports: [BuildingModule, ResearchNodeModule, UnitModule],
})
export class GlobalModule {}
