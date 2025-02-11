import {Field, ID, ObjectType} from '@nestjs/graphql';
import {IsBoolean, IsDate, IsNumber} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {DraftModelInterface} from '@warp-core/core/utils';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';

@ObjectType({description: 'Defines one pending item in building queue'})
@Entity({name: 'building-queue-element'})
export class BuildingQueueElementModel implements DraftModelInterface {
	@Field(() => ID)
	@IsNumber()
	@PrimaryGeneratedColumn()
	public id?: number | null;

	@Field({description: 'What was level on queue start?'})
	@IsNumber()
	@Column('int')
	public startLevel: number;

	@Field({description: 'What was level on queue end?'})
	@IsNumber()
	@Column('int')
	public endLevel: number;

	@Field({description: 'At what time queue element will start?'})
	@IsDate()
	@Column('datetime')
	public startTime: Date;

	@Field({description: 'At what time queue element will end?'})
	@IsDate()
	@Column('datetime')
	public endTime: Date;

	@IsBoolean()
	@Column('boolean')
	public isConsumed: boolean = false;

	@Field(() => BuildingModel, {
		nullable: true,
		description: 'Building connected to queue element',
	})
	@ManyToOne(() => BuildingModel, {
		lazy: true,
	})
	@JoinColumn({name: 'buildingId'})
	public building?: BuildingModel | Promise<BuildingModel> | null;

	@Column({nullable: true})
	public buildingId?: string;

	@Field(() => BuildingZoneModel, {
		description: 'Building zone connected to queue element',
	})
	@ManyToOne(
		() => BuildingZoneModel,
		buildingZone => buildingZone.buildingQueue,
		{
			lazy: true,
		},
	)
	@JoinColumn({name: 'buildingZoneId'})
	public buildingZone: BuildingZoneModel | Promise<BuildingZoneModel>;

	@Column()
	public buildingZoneId?: number;

	@Field(() => [QueueElementCostModel], {
		description: 'How much does that queue element cost?',
	})
	@Column('simple-json')
	public costs: QueueElementCostModel[];
}
