import {Field, ID, Int, ObjectType} from '@nestjs/graphql';
import {Type} from 'class-transformer';
import {
	IsNumber,
	IsOptional,
	IsString,
	Length,
	Min,
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
	OneToOne,
	PrimaryColumn,
} from 'typeorm';

import {BlueprintGlobalModelInterface} from '@warp-core/core/utils/model/blueprint-global.model-interface';
import {CapabilitiesOwnerModelInterface} from '@warp-core/core/utils/model/capabilities-owner.model-interface';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {RequirementsPerLevelModel} from '@warp-core/database/model/level-details/requirements-per-level.model';
import {UnitBlueprintTagModel} from '@warp-core/database/model/unit/unit-blueprint-tag.model';

@ObjectType({
	description:
		'Global unit blueprint, shared by all habitats. Describes what it takes to build the unit and what the unit is able to do.',
})
@Entity({name: 'unit-blueprint-global'})
export class UnitBlueprintGlobalModel
	implements BlueprintGlobalModelInterface, CapabilitiesOwnerModelInterface
{
	@Field(() => ID)
	@IsString()
	@PrimaryColumn()
	public id: string;

	@Field({description: 'What name that kind of unit have'})
	@Length(2, 255)
	@Column('varchar')
	public name: string;

	@Field(() => [UnitBlueprintTagModel], {
		description: 'Tags that connect that blueprint with other ones',
		nullable: true,
	})
	@ValidateNested()
	@ValidatePromise()
	@IsOptional()
	@OneToMany(() => UnitBlueprintTagModel, tag => tag.unitBlueprint, {
		lazy: true,
		nullable: true,
		persistence: false,
		cascade: true,
	})
	@Type(() => UnitBlueprintTagModel)
	public tags?:
		| UnitBlueprintTagModel[]
		| Promise<UnitBlueprintTagModel[]>
		| null;

	@Field(() => Int, {
		description: 'How much time it takes to build a single unit',
	})
	@IsNumber()
	@Min(1)
	@Column('int')
	public timeToBuildInSeconds: number;

	@Field(() => [RequirementsPerLevelModel], {
		description: 'Requirements to build a single unit. Nothing comes for free.',
		nullable: true,
	})
	@ValidateNested()
	@ValidatePromise()
	@IsOptional()
	@OneToMany(
		() => RequirementsPerLevelModel,
		requirement => requirement.unitBlueprint,
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

	@Field(() => CapabilitiesModel, {
		description: 'Global capabilities of the unit, the default for the world',
		nullable: true,
	})
	@ValidateNested()
	@IsOptional()
	@OneToOne(() => CapabilitiesModel, {
		cascade: true,
		eager: true,
		nullable: true,
	})
	@JoinColumn({name: 'capabilitiesId'})
	@Type(() => CapabilitiesModel)
	public capabilities?: CapabilitiesModel | null;

	@Column({name: 'capabilitiesId', nullable: true})
	public capabilitiesId?: number | null;

	@BeforeInsert()
	@BeforeUpdate()
	public async setOneToManyRelations(): Promise<void> {
		const tags = (await this.tags) ?? [];
		for (const tag of tags) {
			if (!(await tag.unitBlueprint)) {
				tag.unitBlueprint = this;
			}
		}

		const requirements = (await this.requirements) ?? [];
		for (const requirement of requirements) {
			if (!(await requirement.unitBlueprint)) {
				requirement.unitBlueprint = this;
			}
		}
	}
}
