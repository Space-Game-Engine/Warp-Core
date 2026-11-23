import {Field, ID, ObjectType} from '@nestjs/graphql';
import {IsNumber} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {InstanceModelInterface} from '@warp-core/core/utils/model/instance.model-interface';
import {CalculatedCapabilitiesModel} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {UnitBlueprintPlayerModel} from '@warp-core/database/model/unit/unit-blueprint-player.model';

@ObjectType({
	description: 'Single unit that belongs to a habitat, built from a blueprint',
})
@Entity({name: 'unit-instance'})
export class UnitInstanceModel implements InstanceModelInterface<UnitBlueprintPlayerModel> {
	@Field(() => ID, {description: 'Id of the unit'})
	@IsNumber()
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => HabitatModel, {
		description: 'Habitat that owns the unit',
	})
	@ManyToOne(() => HabitatModel, {lazy: true})
	@JoinColumn({name: 'habitatId'})
	public habitat: HabitatModel | Promise<HabitatModel>;

	@IsNumber()
	@Column({name: 'habitatId'})
	public habitatId: number;

	@ManyToOne(() => UnitBlueprintPlayerModel, blueprint => blueprint.units, {
		lazy: true,
	})
	@JoinColumn({name: 'unitBlueprintPlayerId'})
	public unitBlueprintPlayer:
		| UnitBlueprintPlayerModel
		| Promise<UnitBlueprintPlayerModel>;

	@IsNumber()
	@Column({name: 'unitBlueprintPlayerId'})
	public unitBlueprintPlayerId: number;

	@Field(() => UnitBlueprintGlobalModel, {
		description: 'What kind of unit is that',
	})
	public unit?: UnitBlueprintGlobalModel;

	@Field(() => CalculatedCapabilitiesModel, {
		description:
			'Effective capabilities of that unit: global blueprint capabilities plus player blueprint bonuses',
	})
	public capabilities?: CalculatedCapabilitiesModel;

	public async getUnit(): Promise<UnitBlueprintGlobalModel> {
		return (await this.getPlayerBlueprint())!.getGlobalBlueprint();
	}

	public async getPlayerBlueprint(): Promise<UnitBlueprintPlayerModel | null> {
		return (await this.unitBlueprintPlayer) ?? null;
	}
}
