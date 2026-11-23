import {Type} from 'class-transformer';
import {IsNumber, IsString, ValidateNested} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	Unique,
} from 'typeorm';

import {BlueprintPlayerModelInterface} from '@warp-core/core/utils/model/blueprint-player.model-interface';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {UnitInstanceModel} from '@warp-core/database/model/unit/unit-instance.model';

/**
 * Hidden layer between a unit instance and the global blueprint, not exposed in GraphQL.
 */
@Entity({name: 'unit-blueprint-player'})
@Unique(['habitatId', 'unitId'])
export class UnitBlueprintPlayerModel implements BlueprintPlayerModelInterface<UnitBlueprintGlobalModel> {
	@IsNumber()
	@PrimaryGeneratedColumn()
	public id: number;

	@ValidateNested()
	@ManyToOne(() => HabitatModel, {lazy: true})
	@JoinColumn({name: 'habitatId'})
	public habitat: HabitatModel | Promise<HabitatModel>;

	@IsNumber()
	@Column({name: 'habitatId'})
	public habitatId: number;

	@ManyToOne(() => UnitBlueprintGlobalModel, {lazy: true})
	@JoinColumn({name: 'unitId'})
	public unit: UnitBlueprintGlobalModel | Promise<UnitBlueprintGlobalModel>;

	@IsString()
	@Column({name: 'unitId'})
	public unitId: string;

	@ValidateNested()
	@OneToOne(() => CapabilitiesModel, {
		cascade: true,
		eager: true,
	})
	@JoinColumn({name: 'capabilitiesId'})
	@Type(() => CapabilitiesModel)
	public capabilities: CapabilitiesModel;

	@Column({name: 'capabilitiesId', nullable: true})
	public capabilitiesId?: number | null;

	@OneToMany(() => UnitInstanceModel, unit => unit.unitBlueprintPlayer, {
		lazy: true,
	})
	public units: UnitInstanceModel[] | Promise<UnitInstanceModel[]>;

	public async getGlobalBlueprint(): Promise<UnitBlueprintGlobalModel> {
		return this.unit;
	}
}
