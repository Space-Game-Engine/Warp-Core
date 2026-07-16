import {Field, ObjectType} from '@nestjs/graphql';

import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {HabitatResourceCombined} from '@warp-core/database/model/resource/habitat-resource.mapped.model';
import {HabitatResourceModel} from '@warp-core/database/model/resource/habitat-resource.model';

@ObjectType({description: 'Single habitat that belongs to user'})
export class HabitatWithResources extends HabitatModel {
	@Field(() => [HabitatResourceCombined])
	declare public habitatResources:
		| HabitatResourceModel[]
		| Promise<HabitatResourceModel[]>;
}
