import {Module} from '@nestjs/common';

import {BuildingBlueprintModule} from '@warp-core/user/blueprint/building-blueprint/building-blueprint.module';

@Module({
	imports: [BuildingBlueprintModule],
})
export class BlueprintModule {}
