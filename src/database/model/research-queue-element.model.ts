import {Field, ID, ObjectType} from '@nestjs/graphql';
import {IsBoolean, IsDate, IsNumber} from 'class-validator';
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
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';

@ObjectType({description: 'Defines one pending item in research queue'})
@Entity({name: 'research-queue-element'})
export class ResearchQueueElementModel implements QueueElementModelInterface {
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

	@Field({description: 'Is a queued item consumed already?'})
	@IsBoolean()
	@Column('boolean')
	public isConsumed: boolean = false;

	@Field(() => ResearchNodeModel, {
		description: 'Research node connected to queue element',
	})
	@ManyToOne(() => ResearchNodeModel, {
		lazy: true,
	})
	@JoinColumn({name: 'researchNodeId'})
	public researchNode: ResearchNodeModel | Promise<ResearchNodeModel>;

	@Column({name: 'researchNodeId'})
	public researchNodeId: string;

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
