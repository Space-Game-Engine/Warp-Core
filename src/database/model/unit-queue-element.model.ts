import {Field, ID, Int, ObjectType} from '@nestjs/graphql';
import {IsBoolean, IsDate, IsNumber, IsPositive} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {QueueElementModelInterface} from '@warp-core/core/utils';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';

@ObjectType({description: 'Defines one pending item in unit queue'})
@Entity({name: 'unit-queue-element'})
export class UnitQueueElementModel implements QueueElementModelInterface {
	@Field(() => ID)
	@IsNumber()
	@PrimaryGeneratedColumn()
	public id?: number | null;

	@Field(() => Int, {description: 'How many units will be built?'})
	@IsNumber()
	@IsPositive()
	@Column('int')
	public amount: number;

	@Field({description: 'At what time queue element will start?'})
	@IsDate()
	@Column('datetime')
	public startTime: Date;

	@Field({description: 'At what time queue element will end?'})
	@IsDate()
	@Column('datetime')
	public endTime: Date;

	@Field({description: 'Is a queued item consumed already?'})
	@IsBoolean()
	@Column('boolean')
	public isConsumed: boolean = false;

	@Field(() => UnitBlueprintGlobalModel, {
		description: 'Unit blueprint connected to queue element',
	})
	@ManyToOne(() => UnitBlueprintGlobalModel, {
		lazy: true,
	})
	@JoinColumn({name: 'unitId'})
	public unit: UnitBlueprintGlobalModel | Promise<UnitBlueprintGlobalModel>;

	@Column({name: 'unitId'})
	public unitId: string;

	@Field(() => HabitatModel, {
		description: 'Habitat connected to queue element',
	})
	@ManyToOne(() => HabitatModel, {
		lazy: true,
	})
	@JoinColumn({name: 'habitatId'})
	public habitat: HabitatModel | Promise<HabitatModel>;

	@Column({name: 'habitatId'})
	public habitatId: number;

	@Field(() => [QueueElementCostModel], {
		description: 'How much does that queue element cost?',
	})
	@Column('simple-json')
	public costs: QueueElementCostModel[];

	public async getHabitatId(): Promise<number> {
		return this.habitatId;
	}
}
