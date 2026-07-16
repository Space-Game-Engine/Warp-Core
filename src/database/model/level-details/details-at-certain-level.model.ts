import {Field, ID, Int, ObjectType} from '@nestjs/graphql';
import {Type} from 'class-transformer';
import {
	IsNumber,
	IsOptional,
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

import {RequirementsPerLevelModel} from '@warp-core/database/model/level-details/requirements-per-level.model';

@ObjectType({
	description: 'Details about upgrade',
})
@Entity('details-at-certain-level-model')
export class DetailsAtCertainLevelModel {
	@Field(() => ID)
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => Int, {description: 'What level is described by this entry'})
	@IsNumber()
	@Min(1)
	@Column('int')
	public level: number;

	@Field(() => Int, {
		description: 'How much time it takes to upgrade that entity',
	})
	@IsNumber()
	@Min(1)
	@Column('int')
	public timeToUpdateInSeconds: number;

	@Field(() => [RequirementsPerLevelModel], {
		description:
			'Requirements to upgrade for specified level. Nothing comes for free.',
		nullable: true,
	})
	@ValidateNested()
	@ValidatePromise()
	@IsOptional()
	@OneToMany(
		() => RequirementsPerLevelModel,
		requirement => requirement.levelDetails,
		{
			lazy: true,
			nullable: true,
			persistence: false,
			cascade: true,
		},
	)
	@Type(() => RequirementsPerLevelModel)
	public requirements?:
		| RequirementsPerLevelModel[]
		| Promise<RequirementsPerLevelModel[]>
		| null;

	@BeforeInsert()
	@BeforeUpdate()
	public async setOneToManyRelations(): Promise<void> {
		const requirements = (await this.requirements) ?? [];
		for (const requirement of requirements) {
			if (!(await requirement.levelDetails)) {
				requirement.levelDetails = this;
			}
		}
	}
}
