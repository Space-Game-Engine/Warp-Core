import {Field, ObjectType} from '@nestjs/graphql';
import {IsNumber} from 'class-validator';
import {Column, Entity} from 'typeorm';

import {AbstractBuildingResourcesDetailsAtCertainLevel} from '@warp-core/database/model/abstracts/building-resources-details-at-certain-level.abstract-model';

@ObjectType({
	description:
		'Defines what kind of resources will be produced by that building',
	implements: () => [AbstractBuildingResourcesDetailsAtCertainLevel],
})
@Entity({name: 'building-production-rate'})
export class BuildingProductionRateModel extends AbstractBuildingResourcesDetailsAtCertainLevel {
	@Field({description: 'Current level production rate'})
	@IsNumber()
	@Column()
	public productionRate: number;
}
