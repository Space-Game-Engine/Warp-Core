import {Field, ObjectType} from '@nestjs/graphql';
import {IsNumber, ValidateNested, ValidatePromise} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {ResourceModel} from '@warp-core/database/model/resource/resource.model';

@ObjectType({
	description: 'Shows how much resource was generated per user habitat',
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

	@Column({type: 'datetime', nullable: false})
	public lastCalculationTime: Date;

	@Field(() => ResourceModel, {description: 'Get connected resource details'})
	@ValidateNested()
	@ValidatePromise()
	@ManyToOne(() => ResourceModel, {
		lazy: true,
	})
	@JoinColumn({name: 'resourceId'})
	public resource: ResourceModel | Promise<ResourceModel>;

	@Column({name: 'resourceId'})
	public resourceId: string;
}
