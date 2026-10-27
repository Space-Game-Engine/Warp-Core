import {Field, Int, ObjectType} from '@nestjs/graphql';
import {
	IsNumber,
	IsOptional,
	IsString,
	Min,
	ValidateNested,
} from 'class-validator';
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
	description:
		'Defines what resources or research nodes are needed to upgrade that entity',
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

	@Field(() => String, {description: 'Id of required resource', nullable: true})
	@IsString()
	@IsOptional()
	@Column({name: 'resourceId', nullable: true})
	public resourceId?: string | null;

	@Field({description: 'Current level cost', nullable: true})
	@IsNumber()
	@Column({nullable: true})
	@IsOptional()
	public cost?: number;

	@Field(() => ResearchNodeModel, {
		description: 'Required research node',
		nullable: true,
	})
	@ManyToOne(() => ResearchNodeModel, {lazy: true, nullable: true})
	@JoinColumn({name: 'researchNodeId'})
	@IsOptional()
	public researchNode?: ResearchNodeModel | Promise<ResearchNodeModel> | null;

	@Field(() => String, {
		description: 'Id of required research node',
		nullable: true,
	})
	@IsString()
	@IsOptional()
	@Column({name: 'researchNodeId', nullable: true})
	public researchNodeId?: string | null;

	@Field(() => Int, {
		description: 'Required level of research node',
		nullable: true,
	})
	@IsNumber()
	@Min(1)
	@Column('integer', {nullable: true})
	@IsOptional()
	public researchNodeLevel?: number;
}
