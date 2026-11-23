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
	description: 'Healing capability: how many HP are restored to tagged units',
})
@Entity({name: 'healing-capability'})
export class HealingCapabilityModel {
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => Float, {description: 'Amount of HP healed in every interval'})
	@IsNumber()
	@Min(0)
	@Column({type: 'float', precision: 10, scale: 4})
	public amount: number;

	@Field(() => Int, {description: 'Healing interval in seconds'})
	@IsNumber()
	@Min(1)
	@Column('int')
	public interval: number;

	@Field(() => [CapabilityTargetModel], {
		description: 'Targets that can be healed',
	})
	@ValidateNested()
	@ValidatePromise()
	@ArrayNotEmpty()
	@OneToMany(() => CapabilityTargetModel, target => target.healingCapability, {
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
			if (!(await target.healingCapability)) {
				target.healingCapability = this;
			}
		}
	}
}
