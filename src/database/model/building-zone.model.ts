import {Field, ObjectType} from '@nestjs/graphql';
import {IsNumber, Min, ValidateNested} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {InstanceModelInterface} from '@warp-core/core/utils/model/instance.model-interface';
import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {BuildingBlueprintPlayerModel} from '@warp-core/database/model/building/building-blueprint-player.model';
import {BuildingDetailsAtCertainLevelModel} from '@warp-core/database/model/building/building-details-at-certain-level.model';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {CalculatedCapabilitiesModel} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';

@ObjectType({
	description:
		'Single building zone, you can build here single building and level it up',
})
@Entity({name: 'building-zone'})
export class BuildingZoneModel implements InstanceModelInterface<BuildingBlueprintPlayerModel> {
	/**
	 * Minimal level with created building on that zone
	 */
	public static readonly MINIMAL_BUILDING_LEVEL = 1;

	// Real ID of building zone
	@IsNumber()
	@PrimaryGeneratedColumn()
	public id: number;

	@Field({description: 'Building zone id counted for single habitat'})
	@IsNumber()
	@Column('int')
	public localBuildingZoneId: number;

	@Field(() => HabitatModel, {
		description: 'Habitat connected to that building zone',
	})
	@ValidateNested()
	@ManyToOne(() => HabitatModel, habitat => habitat.buildingZones, {
		lazy: true,
	})
	@JoinColumn({name: 'habitatId'})
	public habitat: HabitatModel | Promise<HabitatModel>;

	@Column({name: 'habitatId'})
	public habitatId: number;

	@Field(() => BuildingBlueprintPlayerModel, {
		nullable: true,
		description:
			'Player blueprint of the building placed here. Empty when nothing is built yet.',
	})
	@ManyToOne(
		() => BuildingBlueprintPlayerModel,
		blueprint => blueprint.buildingZones,
		{
			lazy: true,
			nullable: true,
		},
	)
	@JoinColumn({name: 'buildingBlueprintPlayerId'})
	public buildingBlueprintPlayer?:
		| BuildingBlueprintPlayerModel
		| Promise<BuildingBlueprintPlayerModel>
		| null;

	@Column({name: 'buildingBlueprintPlayerId', nullable: true})
	public buildingBlueprintPlayerId?: number | null;

	@Field(() => BuildingBlueprintGlobalModel, {
		nullable: true,
		description: 'What kind of building is placed here',
	})
	public building?: BuildingBlueprintGlobalModel | null;

	@Field(() => CalculatedCapabilitiesModel, {
		nullable: true,
		description:
			'Effective capabilities of that building zone: global blueprint capabilities at current level plus player blueprint bonuses',
	})
	public capabilities?: CalculatedCapabilitiesModel | null;

	@Field({description: 'What level is that'})
	@IsNumber()
	@Min(0)
	@Column('int')
	public level: number = 0;

	@Field({
		nullable: true,
		description: 'Where is that building zone placed in our habitat',
	})
	@Column('simple-json')
	public placement?: string;

	@Field(() => [BuildingQueueElementModel], {
		description: 'List of all queues connected to that building zone',
	})
	@OneToMany(
		() => BuildingQueueElementModel,
		buildingQueue => buildingQueue.buildingZone,
		{
			lazy: true,
		},
	)
	public buildingQueue:
		| BuildingQueueElementModel[]
		| Promise<BuildingQueueElementModel[]>;

	private currentLevelBuildingDetails: BuildingDetailsAtCertainLevelModel | null =
		null;

	public async getPlayerBlueprint(): Promise<BuildingBlueprintPlayerModel | null> {
		return (await this.buildingBlueprintPlayer) ?? null;
	}

	public async getBuilding(): Promise<BuildingBlueprintGlobalModel | null> {
		const playerBlueprint = await this.getPlayerBlueprint();

		if (!playerBlueprint) {
			return null;
		}

		return playerBlueprint.getGlobalBlueprint();
	}

	public async getBuildingLevelDetails(): Promise<BuildingDetailsAtCertainLevelModel | null> {
		if (this.currentLevelBuildingDetails !== null) {
			return this.currentLevelBuildingDetails;
		}

		const building = await this.getBuilding();

		if (!building) {
			return null;
		}

		this.currentLevelBuildingDetails =
			(await building.buildingDetailsAtCertainLevel).find(
				buildingDetails => buildingDetails.details.level === this.level,
			) ?? null;

		return this.currentLevelBuildingDetails;
	}
}
