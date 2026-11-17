import {Field, ID, ObjectType} from '@nestjs/graphql';
import {Type} from 'class-transformer';
import {
	ArrayNotEmpty,
	IsEnum,
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
	OneToMany,
	PrimaryColumn,
} from 'typeorm';

import {BlueprintGlobalModelInterface} from '@warp-core/core/utils/model/blueprint-global.model-interface';
import {BuildingRoleEnum} from '@warp-core/database/enum/building-role.enum';
import {BuildingDetailsAtCertainLevelModel} from '@warp-core/database/model/building/building-details-at-certain-level.model';

@ObjectType({
	description:
		'Global building blueprint, shared by all habitats. Describes building role and how it behaves on every level.',
})
@Entity({name: 'building-blueprint-global'})
export class BuildingBlueprintGlobalModel implements BlueprintGlobalModelInterface {
	@Field(() => ID)
	@IsString()
	@PrimaryColumn()
	public id: string;

	@Field(() => BuildingRoleEnum, {
		description: 'Role says what that building do',
	})
	@IsEnum(BuildingRoleEnum)
	@Column('varchar')
	public role: BuildingRoleEnum;

	@Field({description: 'What name that kind of building have'})
	@Length(2, 255)
	@Column('varchar')
	public name: string;

	@Field(() => [BuildingDetailsAtCertainLevelModel], {
		description: 'Details how to upgrade that building',
	})
	@ValidateNested()
	@ValidatePromise()
	@ArrayNotEmpty()
	@OneToMany(
		() => BuildingDetailsAtCertainLevelModel,
		details => details.building,
		{
			lazy: true,
			persistence: false,
			cascade: true,
		},
	)
	@Type(() => BuildingDetailsAtCertainLevelModel)
	public buildingDetailsAtCertainLevel:
		| BuildingDetailsAtCertainLevelModel[]
		| Promise<BuildingDetailsAtCertainLevelModel[]>;

	@BeforeInsert()
	@BeforeUpdate()
	public async setOneToManyRelations(): Promise<void> {
		const buildingDetails = await this.buildingDetailsAtCertainLevel;
		for (const buildingDetail of buildingDetails) {
			if (!(await buildingDetail.building)) {
				buildingDetail.building = this;
			}
		}
	}
}
