import {Field, Float, Int, ObjectType} from '@nestjs/graphql';
import {IsNumber, IsOptional, Min, ValidateNested} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {ResourceModel} from '@warp-core/database/model/resource/resource.model';

@ObjectType({
	description:
		'Production capability (resource flow): how much of a resource is produced in every interval',
})
@Entity({name: 'production-capability'})
export class ProductionCapabilityModel {
	@PrimaryGeneratedColumn()
	@IsNumber()
	@IsOptional()
	public id: number;

	@Field(() => CapabilitiesModel, {
		description: 'Capabilities set that production belongs to',
	})
	@ValidateNested()
	@ManyToOne(() => CapabilitiesModel, capabilities => capabilities.production, {
		lazy: true,
	})
	@JoinColumn({name: 'capabilitiesId'})
	public capabilities: CapabilitiesModel | Promise<CapabilitiesModel>;

	@Field(() => ResourceModel, {description: 'Get connected resource details'})
	@ManyToOne(() => ResourceModel, {
		lazy: true,
	})
	@JoinColumn({name: 'resourceId'})
	public resource: ResourceModel | Promise<ResourceModel>;

	@Field(() => String, {description: 'Id of produced resource'})
	@Column({name: 'resourceId'})
	public resourceId: string;

	@Field(() => Float, {description: 'Amount of resource produced per interval'})
	@IsNumber()
	@Min(0)
	@Column({type: 'float', precision: 10, scale: 4})
	public amount: number;

	@Field(() => Int, {description: 'Production interval in seconds'})
	@IsNumber()
	@Min(1)
	@Column('int')
	public interval: number;
}
