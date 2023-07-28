import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {ResourceModel} from '@warp-core/database/model/resource.model';
import {Field, ObjectType} from '@nestjs/graphql';
import {IsNumber, ValidateNested} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@ObjectType({
	description: 'Resource type, defines what kind of resources are in game',
})
@Entity({name: 'habitat-resource'})
export class HabitatResourceModel {
	@PrimaryGeneratedColumn()
	id: string;

	@Field(() => HabitatModel, {
		description: 'Habitat connected to that resource',
	})
	@ValidateNested()
	@ManyToOne(() => HabitatModel, habitat => habitat.habitatResources, {
		lazy: true,
	})
	@JoinColumn({name: 'habitatId'})
	habitat: HabitatModel | Promise<HabitatModel>;

	@Column({name: 'habitatId'})
	habitatId: number;

	@Field({description: 'Current amount of the resources'})
	@IsNumber()
	@Column('int')
	currentAmount: number = 0;

	@Column({type: 'datetime', nullable: true})
	lastCalculationTime: Date | null = null;

	@Field(() => ResourceModel, {description: 'Get connected resource details'})
	@ValidateNested()
	@ManyToOne(() => ResourceModel, {
		lazy: true,
	})
	@JoinColumn({name: 'resourceId'})
	resource: ResourceModel | Promise<ResourceModel>;

	@Column({name: 'resourceId'})
	resourceId: string;
}
