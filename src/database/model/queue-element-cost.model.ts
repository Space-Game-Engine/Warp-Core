import {Field, ObjectType} from '@nestjs/graphql';

import {ResourceModel} from '@warp-core/database/model/resource.model';

@ObjectType({
	description: 'Detailed information with resources required be used in queue.',
})
export class QueueElementCostModel {
	@Field(() => ResourceModel)
	public resource: ResourceModel;

	@Field({description: 'Resources used for that queue element'})
	public cost: number;
}
