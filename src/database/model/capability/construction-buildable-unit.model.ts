import {Field, ID, ObjectType} from '@nestjs/graphql';
import {IsString, ValidateNested} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {ConstructionCapabilityModel} from '@warp-core/database/model/capability/construction-capability.model';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';

@ObjectType({
	description: 'Unit that can be built thanks to construction capability',
})
@Entity({name: 'construction-buildable-unit'})
export class ConstructionBuildableUnitModel {
	@Field(() => ID, {description: 'Id of the buildable unit entry'})
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => ConstructionCapabilityModel, {
		description: 'Construction capability that allows to build the unit',
	})
	@ValidateNested()
	@ManyToOne(
		() => ConstructionCapabilityModel,
		construction => construction.buildableUnits,
		{lazy: true},
	)
	@JoinColumn({name: 'constructionCapabilityId'})
	public constructionCapability:
		| ConstructionCapabilityModel
		| Promise<ConstructionCapabilityModel>;

	@Field(() => UnitBlueprintGlobalModel, {
		description: 'Unit that can be built',
	})
	@ManyToOne(() => UnitBlueprintGlobalModel, {lazy: true})
	@JoinColumn({name: 'unitBlueprintId'})
	public unitBlueprint:
		| UnitBlueprintGlobalModel
		| Promise<UnitBlueprintGlobalModel>;

	@Field(() => String, {description: 'Id of the unit that can be built'})
	@IsString()
	@Column({name: 'unitBlueprintId'})
	public unitBlueprintId: string;
}
