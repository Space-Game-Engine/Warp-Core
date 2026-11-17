import {Field, ID, ObjectType} from '@nestjs/graphql';
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
import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';

@ObjectType({
	description:
		'Player building blueprint: per-habitat view of a global building blueprint. Created when the first building of that kind is built and holds bonus capabilities added to the global ones.',
})
@Entity({name: 'building-blueprint-player'})
@Unique(['habitatId', 'buildingId'])
export class BuildingBlueprintPlayerModel implements BlueprintPlayerModelInterface<BuildingBlueprintGlobalModel> {
	@Field(() => ID, {description: 'Id of player building blueprint'})
	@IsNumber()
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => HabitatModel, {
		description: 'Habitat that owns that blueprint',
	})
	@ValidateNested()
	@ManyToOne(() => HabitatModel, habitat => habitat.buildingBlueprints, {
		lazy: true,
	})
	@JoinColumn({name: 'habitatId'})
	public habitat: HabitatModel | Promise<HabitatModel>;

	@IsNumber()
	@Column({name: 'habitatId'})
	public habitatId: number;

	@Field(() => BuildingBlueprintGlobalModel, {
		description: 'Global building blueprint that player blueprint is based on',
	})
	@ManyToOne(() => BuildingBlueprintGlobalModel, {
		lazy: true,
	})
	@JoinColumn({name: 'buildingId'})
	public building:
		| BuildingBlueprintGlobalModel
		| Promise<BuildingBlueprintGlobalModel>;

	@Field(() => String, {description: 'Id of global building blueprint'})
	@IsString()
	@Column({name: 'buildingId'})
	public buildingId: string;

	@Field(() => CapabilitiesModel, {
		description:
			'Bonus capabilities of that habitat, summed with global blueprint capabilities of the current level',
	})
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

	@Field(() => [BuildingZoneModel], {
		description: 'Building zones (instances) created from that blueprint',
	})
	@OneToMany(
		() => BuildingZoneModel,
		buildingZone => buildingZone.buildingBlueprintPlayer,
		{
			lazy: true,
		},
	)
	public buildingZones: BuildingZoneModel[] | Promise<BuildingZoneModel[]>;

	public async getGlobalBlueprint(): Promise<BuildingBlueprintGlobalModel> {
		return this.building;
	}
}
