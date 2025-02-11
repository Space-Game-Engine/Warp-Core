import {Module} from '@nestjs/common';

import {BuildingModule} from '@warp-core/global/building/building.module';

@Module({
	imports: [BuildingModule],
})
export class GlobalModule {}
