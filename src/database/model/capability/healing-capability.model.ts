import {Field, Float, Int, ObjectType} from '@nestjs/graphql';
import {IsNumber, ValidateNested} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {AbstractTargetedCapabilityModel} from '@warp-core/database/model/capability/abstract-targeted-capability.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

@ObjectType({
	description:
		'Healing capability: how many HP are restored to a single target. Player capabilities store changes of those values.',
})
@Entity({name: 'healing-capability'})
export class HealingCapabilityModel extends AbstractTargetedCapabilityModel {
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => CapabilitiesModel, {
		description: 'Capabilities set that healing belongs to',
	})
	@ValidateNested()
	@ManyToOne(() => CapabilitiesModel, capabilities => capabilities.healing, {
		lazy: true,
	})
	@JoinColumn({name: 'capabilitiesId'})
	public capabilities: CapabilitiesModel | Promise<CapabilitiesModel>;

	@Field(() => Float, {description: 'Amount of HP healed in every interval'})
	@IsNumber()
	@Column({type: 'float', precision: 10, scale: 4})
	public amount: number;

	@Field(() => Int, {description: 'Healing interval in seconds'})
	@IsNumber()
	@Column('int')
	public interval: number;
}
