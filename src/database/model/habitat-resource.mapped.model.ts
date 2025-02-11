import {IntersectionType, ObjectType, OmitType} from '@nestjs/graphql';

import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {ResourceModel} from '@warp-core/database/model/resource.model';

@ObjectType()
export class HabitatResourceCombined extends IntersectionType(
	ResourceModel,
	OmitType(HabitatResourceModel, [
		'id',
		'lastCalculationTime',
		'resource',
	] as const),
) {
	constructor(
		public readonly resourceModelSource: ResourceModel,
		public readonly habitatResourceModelSource: HabitatResourceModel,
	) {
		super();

		this.currentAmount = habitatResourceModelSource.currentAmount;
		this.habitatId = habitatResourceModelSource.habitatId;
		this.id = resourceModelSource.id;
		this.name = resourceModelSource.name;
		this.type = resourceModelSource.type;
	}
}
