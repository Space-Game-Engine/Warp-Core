import {Field, ObjectType} from '@nestjs/graphql';
import {IsNumber, ValidateNested} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {ResourceModel} from '@warp-core/database/model/resource.model';

@ObjectType({
	description: 'Resource type, defines what kind of resources are in game',
})
@Entity({name: 'habitat-resource'})
export class HabitatResourceModel {
	@PrimaryGeneratedColumn()
	public id: string;

	@Field(() => HabitatModel, {
		description: 'Habitat connected to that resource',
	})
	@ValidateNested()
	@ManyToOne(() => HabitatModel, habitat => habitat.habitatResources, {
		lazy: true,
	})
	@JoinColumn({name: 'habitatId'})
	public habitat: HabitatModel | Promise<HabitatModel>;

	@Column({name: 'habitatId'})
	public habitatId: number;

	@Field({description: 'Current amount of the resources'})
	@IsNumber()
	@Column('int')
	public currentAmount: number = 0;

	@Column({type: 'datetime', nullable: true})
	public lastCalculationTime: Date | null = null;

	@Field(() => ResourceModel, {description: 'Get connected resource details'})
	@ValidateNested()
	@ManyToOne(() => ResourceModel, {
		lazy: true,
	})
	@JoinColumn({name: 'resourceId'})
	public resource: ResourceModel | Promise<ResourceModel>;

	@Column({name: 'resourceId'})
	public resourceId: string;
}
