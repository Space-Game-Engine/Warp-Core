import {Field, ID, ObjectType} from '@nestjs/graphql';
import {Type} from 'class-transformer';
import {
	ArrayNotEmpty,
	IsString,
	Length,
	ValidateNested,
	ValidatePromise,
} from 'class-validator';
import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	JoinColumn,
	OneToMany,
	PrimaryColumn,
} from 'typeorm';

import {ResearchNodeDetailsAtCertainLevelModel} from '@warp-core/database/model/research-node/research-node-details-at-certain-level.model';

@ObjectType({
	description: 'Research node',
})
@Entity({name: 'research-node'})
export class ResearchNodeModel {
	@PrimaryColumn({unique: true})
	@Field(() => ID)
	@IsString()
	public id: string;

	@Field({description: 'What name that research node have.'})
	@Length(2, 255)
	@Column('varchar')
	public name: string;

	@Field(() => [ResearchNodeDetailsAtCertainLevelModel], {
		description: 'Details how to upgrade that building',
	})
	@ValidateNested()
	@ValidatePromise()
	@ArrayNotEmpty()
	@OneToMany(
		() => ResearchNodeDetailsAtCertainLevelModel,
		details => details.researchNode,
		{
			lazy: true,
			persistence: false,
			cascade: true,
		},
	)
	@JoinColumn({name: 'researchNodeDetailsAtCertainLevelId'})
	@Type(() => ResearchNodeDetailsAtCertainLevelModel)
	public researchNodeDetailsAtCertainLevel:
		| ResearchNodeDetailsAtCertainLevelModel[]
		| Promise<ResearchNodeDetailsAtCertainLevelModel[]>;

	@BeforeInsert()
	@BeforeUpdate()
	public async setOneToManyRelations(): Promise<void> {
		const levelDetails = await this.researchNodeDetailsAtCertainLevel;
		for (const singleLevelDetail of levelDetails) {
			if (!(await singleLevelDetail.researchNode)) {
				singleLevelDetail.researchNode = this;
			}
		}
	}
}
