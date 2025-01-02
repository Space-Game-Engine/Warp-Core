import {Field, InterfaceType} from '@nestjs/graphql';
import {Column, JoinColumn, ManyToOne} from 'typeorm';

import {AbstractDetailsAtCertainLevelModel} from '@warp-core/database/model/abstracts/details-at-certain-level.abstract-model';
import {ResourceModel} from '@warp-core/database/model/resource.model';

@InterfaceType()
export abstract class AbstractBuildingResourcesDetailsAtCertainLevel extends AbstractDetailsAtCertainLevelModel {
	@Field(() => ResourceModel, {description: 'Get connected resource details'})
	@ManyToOne(() => ResourceModel, {
		lazy: true,
	})
	@JoinColumn({name: 'resourceId'})
	public resource: ResourceModel | Promise<ResourceModel>;

	@Column({name: 'resourceId'})
	public resourceId: string;
}
