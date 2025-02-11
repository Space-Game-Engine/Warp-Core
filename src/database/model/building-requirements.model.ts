import {Field, ObjectType} from '@nestjs/graphql';
import {IsNumber, IsOptional, ValidateNested} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {BuildingDetailsAtCertainLevelModel} from '@warp-core/database/model/building-details-at-certain-level.model';
import {ResourceModel} from '@warp-core/database/model/resource.model';

@ObjectType({
	description: 'Defines what resources are needed to build that building',
})
@Entity({name: 'building-requirements'})
export class BuildingRequirementsModel {
	@PrimaryGeneratedColumn()
	@IsNumber()
	@IsOptional()
	public id: number;

	@Field(() => BuildingDetailsAtCertainLevelModel, {
		description: 'Details how to upgrade that building',
	})
	@ValidateNested()
	@ManyToOne(
		() => BuildingDetailsAtCertainLevelModel,
		buildingDetails => buildingDetails.productionRate,
		{
			lazy: true,
		},
	)
	public buildingDetails:
		| BuildingDetailsAtCertainLevelModel
		| Promise<BuildingDetailsAtCertainLevelModel>;

	@Field(() => ResourceModel, {description: 'Get connected resource details'})
	@ManyToOne(() => ResourceModel, {
		lazy: true,
	})
	@JoinColumn({name: 'resourceId'})
	public resource: ResourceModel | Promise<ResourceModel>;

	@Column({name: 'resourceId'})
	public resourceId: string;
	@Field({description: 'Current level cost'})
	@IsNumber()
	@Column()
	public cost: number;
}
