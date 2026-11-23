import {Field, ID, ObjectType} from '@nestjs/graphql';
import {IsString, Length} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';

@ObjectType({
	description:
		'Tag defined by game designer, used to connect multiple unit blueprints',
})
@Entity({name: 'unit-blueprint-tag'})
export class UnitBlueprintTagModel {
	@Field(() => ID, {description: 'Id of the tag entry'})
	@PrimaryGeneratedColumn()
	public id: number;

	@Field({description: 'Tag name'})
	@IsString()
	@Length(1, 255)
	@Column('varchar')
	public tag: string;

	@Field(() => UnitBlueprintGlobalModel, {
		description: 'Unit blueprint with that tag',
	})
	@ManyToOne(() => UnitBlueprintGlobalModel, unit => unit.tags, {lazy: true})
	@JoinColumn({name: 'unitBlueprintId'})
	public unitBlueprint:
		| UnitBlueprintGlobalModel
		| Promise<UnitBlueprintGlobalModel>;
}
