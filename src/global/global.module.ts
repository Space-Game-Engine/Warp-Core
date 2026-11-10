import {Module} from '@nestjs/common';

import {BuildingModule} from '@warp-core/global/building/building.module';
import {ResearchNodeModule} from '@warp-core/global/research-node/research-node.module';

@Module({
	imports: [BuildingModule, ResearchNodeModule],
})
export class GlobalModule {}
