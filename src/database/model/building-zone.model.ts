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

import {BuildingRoleEnum} from '@warp-core/database/enum/building-role.enum';
import {BuildingDetailsAtCertainLevelModel} from '@warp-core/database/model/building-details-at-certain-level.model';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';

@ObjectType({
	description:
		'Single building zone, you can build here single building and level it up',
})
@Entity({name: 'building-zone'})
export class BuildingZoneModel {
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

	@Field(() => BuildingModel, {
		nullable: true,
		description: 'What kind of building is placed here',
	})
	@ManyToOne(() => BuildingModel, {
		lazy: true,
	})
	@JoinColumn({name: 'buildingId'})
	public building?: BuildingModel | Promise<BuildingModel>;

	@Column({name: 'buildingId', nullable: true})
	public buildingId?: string;

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

	public async getBuildingLevelDetails(): Promise<BuildingDetailsAtCertainLevelModel | null> {
		if (this.currentLevelBuildingDetails !== null) {
			return this.currentLevelBuildingDetails;
		}

		const building = await this.building;

		if (!building) {
			return null;
		}

		this.currentLevelBuildingDetails =
			(await building.buildingDetailsAtCertainLevel).find(
				details => details.level === this.level,
			) ?? null;

		return this.currentLevelBuildingDetails;
	}

	public async hasWarehouse(): Promise<boolean> {
		const building = await this.building;
		if (!building) {
			return false;
		}

		if (building.role === BuildingRoleEnum.WAREHOUSE_ONLY) {
			return true;
		}

		const buildingDetails = await this.getBuildingLevelDetails();

		if (!buildingDetails) {
			return false;
		}

		const warehouses = (await buildingDetails.warehouse) ?? [];

		if (warehouses.length > 0) {
			return true;
		}

		return false;
	}
}
