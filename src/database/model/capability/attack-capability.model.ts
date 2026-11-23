import {Field, Float, Int, ObjectType} from '@nestjs/graphql';
import {Type} from 'class-transformer';
import {
	ArrayNotEmpty,
	IsNumber,
	Min,
	ValidateNested,
	ValidatePromise,
} from 'class-validator';
import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {CapabilityTargetModel} from '@warp-core/database/model/capability/capability-target.model';

@ObjectType({
	description: 'Attack capability: how much damage can be done and how often',
})
@Entity({name: 'attack-capability'})
export class AttackCapabilityModel {
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => Float, {description: 'Damage done by a single attack'})
	@IsNumber()
	@Min(0)
	@Column({type: 'float', precision: 10, scale: 4})
	public damage: number;

	@Field(() => Int, {description: 'Cooldown between attacks in seconds'})
	@IsNumber()
	@Min(0)
	@Column('int')
	public cooldown: number;

	@Field(() => [CapabilityTargetModel], {
		description: 'Targets that can be attacked',
	})
	@ValidateNested()
	@ValidatePromise()
	@ArrayNotEmpty()
	@OneToMany(() => CapabilityTargetModel, target => target.attackCapability, {
		lazy: true,
		persistence: false,
		cascade: true,
	})
	@Type(() => CapabilityTargetModel)
	public targets: CapabilityTargetModel[] | Promise<CapabilityTargetModel[]>;

	@BeforeInsert()
	@BeforeUpdate()
	public async setOneToManyRelations(): Promise<void> {
		for (const target of await this.targets) {
			if (!(await target.attackCapability)) {
				target.attackCapability = this;
			}
		}
	}
}
