import {Field, ObjectType} from '@nestjs/graphql';

import {HabitatResourceCombined} from '@warp-core/database/model/habitat-resource.mapped.model';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';

@ObjectType({description: 'Single habitat that belongs to user'})
export class HabitatWithResources extends HabitatModel {
	@Field(() => [HabitatResourceCombined])
	declare public habitatResources:
		| HabitatResourceModel[]
		| Promise<HabitatResourceModel[]>;
}
