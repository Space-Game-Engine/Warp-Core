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
		'Attack capability: how much damage can be done to a single target and how often. Player capabilities store changes of those values.',
})
@Entity({name: 'attack-capability'})
export class AttackCapabilityModel extends AbstractTargetedCapabilityModel {
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => CapabilitiesModel, {
		description: 'Capabilities set that attack belongs to',
	})
	@ValidateNested()
	@ManyToOne(() => CapabilitiesModel, capabilities => capabilities.attack, {
		lazy: true,
	})
	@JoinColumn({name: 'capabilitiesId'})
	public capabilities: CapabilitiesModel | Promise<CapabilitiesModel>;

	@Field(() => Float, {description: 'Damage done by a single attack'})
	@IsNumber()
	@Column({type: 'float', precision: 10, scale: 4})
	public damage: number;

	@Field(() => Int, {description: 'Cooldown between attacks in seconds'})
	@IsNumber()
	@Column('int')
	public cooldown: number;
}
