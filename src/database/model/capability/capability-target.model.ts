import {Field, ID, ObjectType} from '@nestjs/graphql';
import {IsEnum, IsString, Length, ValidateNested} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {CapabilityTargetTypeEnum} from '@warp-core/database/enum/capability-target-type.enum';
import {AttackCapabilityModel} from '@warp-core/database/model/capability/attack-capability.model';
import {HealingCapabilityModel} from '@warp-core/database/model/capability/healing-capability.model';

@ObjectType({
	description:
		'Target of a capability (attack, healing): precise unit, unit tag or movement layer',
})
@Entity({name: 'capability-target'})
export class CapabilityTargetModel {
	@Field(() => ID, {description: 'Id of the target entry'})
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => CapabilityTargetTypeEnum, {
		description: 'Says how to read the value',
	})
	@IsEnum(CapabilityTargetTypeEnum)
	@Column('varchar')
	public type: CapabilityTargetTypeEnum;

	@Field({
		description: 'Unit id, tag name or movement layer id, based on the type',
	})
	@IsString()
	@Length(1, 255)
	@Column('varchar')
	public value: string;

	@Field(() => AttackCapabilityModel, {
		description: 'Attack capability that uses that target',
		nullable: true,
	})
	@ValidateNested()
	@ManyToOne(() => AttackCapabilityModel, attack => attack.targets, {
		lazy: true,
		nullable: true,
	})
	@JoinColumn({name: 'attackCapabilityId'})
	public attackCapability?:
		| AttackCapabilityModel
		| Promise<AttackCapabilityModel>
		| null;

	@Field(() => HealingCapabilityModel, {
		description: 'Healing capability that uses that target',
		nullable: true,
	})
	@ValidateNested()
	@ManyToOne(() => HealingCapabilityModel, healing => healing.targets, {
		lazy: true,
		nullable: true,
	})
	@JoinColumn({name: 'healingCapabilityId'})
	public healingCapability?:
		| HealingCapabilityModel
		| Promise<HealingCapabilityModel>
		| null;
}
