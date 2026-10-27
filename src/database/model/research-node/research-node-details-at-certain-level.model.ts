import {Field, ID, ObjectType} from '@nestjs/graphql';
import {Type} from 'class-transformer';
import {IsOptional, ValidateNested} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';

@ObjectType({
	description: 'Details how to upgrade single research node level',
})
@Entity({name: 'research-node-details-at-certain-level'})
export class ResearchNodeDetailsAtCertainLevelModel {
	@Field(() => ID, {description: 'Id of research node level details'})
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => DetailsAtCertainLevelModel, {
		description: 'The details of certain level',
	})
	@OneToOne(() => DetailsAtCertainLevelModel, {
		cascade: true,
		eager: true,
	})
	@JoinColumn({name: 'detailsId'})
	@ValidateNested()
	@Type(() => DetailsAtCertainLevelModel)
	public details: DetailsAtCertainLevelModel;

	@Column({name: 'detailsId'})
	public detailsId: number;

	@Field(() => ResearchNodeModel, {
		description: 'Research node connected to that details',
	})
	@ManyToOne(() => ResearchNodeModel, {lazy: true, nullable: true})
	@JoinColumn({name: 'researchNodeId'})
	@IsOptional()
	public researchNode?: ResearchNodeModel | Promise<ResearchNodeModel> | null;

	@Column({name: 'researchNodeId', nullable: true})
	public researchNodeId?: string | null;
}
