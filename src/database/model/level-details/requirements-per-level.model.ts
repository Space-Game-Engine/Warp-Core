import {Field, ObjectType} from '@nestjs/graphql';
import {IsNumber, IsOptional, ValidateNested} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';
import {ResearchNodeModel} from '@warp-core/database/model/research-node/research-node.model';
import {ResourceModel} from '@warp-core/database/model/resource/resource.model';

@ObjectType({
	description: 'Defines what resources are needed to build that entity',
})
@Entity({name: 'requirements-per-level'})
export class RequirementsPerLevelModel {
	@PrimaryGeneratedColumn()
	@IsNumber()
	@IsOptional()
	public id: number;

	@Field(() => DetailsAtCertainLevelModel, {
		description: 'Details how to upgrade that entity',
	})
	@ValidateNested()
	@ManyToOne(
		() => DetailsAtCertainLevelModel,
		levelDetails => levelDetails.requirements,
		{
			lazy: true,
		},
	)
	public levelDetails:
		| DetailsAtCertainLevelModel
		| Promise<DetailsAtCertainLevelModel>;

	@Field(() => ResourceModel, {
		description: 'Get connected resource details',
		nullable: true,
	})
	@ManyToOne(() => ResourceModel, {
		lazy: true,
	})
	@JoinColumn({name: 'resourceId'})
	@IsOptional()
	public resource?: ResourceModel | Promise<ResourceModel> | null;

	@Column({name: 'resourceId', nullable: true})
	public resourceId?: string | null;

	@Field({description: 'Current level cost', nullable: true})
	@IsNumber()
	@Column()
	@IsOptional()
	public cost?: number;

	@Field(() => ResearchNodeModel, {
		description: 'Required research node',
	})
	@ManyToOne(() => ResearchNodeModel, {lazy: true, nullable: true})
	@JoinColumn({name: 'researchNodeId'})
	@IsOptional()
	public researchNode?: ResearchNodeModel | Promise<ResearchNodeModel> | null;

	@Column({name: 'researchNodeId', nullable: true})
	public researchNodeId?: string | null;

	@Field({description: 'Required level of research node', nullable: true})
	@IsNumber()
	@Column('integer', {nullable: true})
	@IsOptional()
	public researchNodeLevel?: number;
}
