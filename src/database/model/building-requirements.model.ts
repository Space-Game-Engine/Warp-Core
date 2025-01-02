import {Field, ObjectType} from '@nestjs/graphql';
import {IsNumber} from 'class-validator';
import {Column, Entity} from 'typeorm';

import {AbstractBuildingResourcesDetailsAtCertainLevel} from '@warp-core/database/model/abstracts/building-resources-details-at-certain-level.abstract-model';

@ObjectType({
	description: 'Defines what resources are needed to build that building',
	implements: () => [AbstractBuildingResourcesDetailsAtCertainLevel],
})
@Entity({name: 'building-requirements'})
export class BuildingRequirementsModel extends AbstractBuildingResourcesDetailsAtCertainLevel {
	@Field({description: 'Current level cost'})
	@IsNumber()
	@Column()
	public cost: number;
}
