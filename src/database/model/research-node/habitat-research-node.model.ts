import {Field, ObjectType} from '@nestjs/graphql';
import {IsNumber, ValidateNested, ValidatePromise} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';

@ObjectType({
	description: 'Shows developed research node per habitat.',
})
@Entity({name: 'habitat-research-node'})
export class HabitatResearchNodeModel {
	@PrimaryGeneratedColumn()
	public id: string;

	@Field(() => HabitatModel, {
		description: 'Habitat connected to that research node.',
	})
	@ValidateNested()
	@ManyToOne(() => HabitatModel, habitat => habitat.habitatResearchNode, {
		lazy: true,
	})
	@JoinColumn({name: 'habitatId'})
	public habitat: HabitatModel | Promise<HabitatModel>;

	@Column({name: 'habitatId'})
	public habitatId: number;

	@Field({
		description: 'Current research node level.',
	})
	@IsNumber()
	@Column('int')
	public currentLevel: number = 0;

	@Column({type: 'datetime', nullable: false})
	public lastCalculationTime: Date;

	@Field(() => ResearchNodeModel, {
		description: 'Get connected research node details',
	})
	@ValidateNested()
	@ValidatePromise()
	@ManyToOne(() => ResearchNodeModel, {
		lazy: true,
	})
	@JoinColumn({name: 'researchNodeId'})
	public researchNode: ResearchNodeModel | Promise<ResearchNodeModel>;

	@Column({name: 'researchNodeId'})
	public researchNodeId: string;
}
