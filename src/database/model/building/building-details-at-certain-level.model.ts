import {Field, ID, ObjectType} from '@nestjs/graphql';
import {Type} from 'class-transformer';
import {IsOptional, ValidateNested, ValidatePromise} from 'class-validator';
import {
	BeforeInsert,
	BeforeUpdate,
	Entity,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {BuildingProductionRateModel} from '@warp-core/database/model/building/building-production-rate.model';
import {BuildingModel} from '@warp-core/database/model/building/building.model';
import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';
import {WarehouseDetailsModel} from '@warp-core/database/model/warehouse-details.model';

@ObjectType({
	description: 'Details how to upgrade single building',
})
@Entity({name: 'building-details-at-certain-level'})
export class BuildingDetailsAtCertainLevelModel {
	@Field(() => ID)
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => DetailsAtCertainLevelModel, {
		description: 'The details of certain level',
	})
	@OneToOne(() => DetailsAtCertainLevelModel, {
		cascade: true,
		eager: true,
	})
	public details: DetailsAtCertainLevelModel;

	@Field(() => BuildingModel, {
		description: 'Building connected to that details',
	})
	@ManyToOne(
		() => BuildingModel,
		building => building.buildingDetailsAtCertainLevel,
		{
			lazy: true,
		},
	)
	public building: BuildingModel | Promise<BuildingModel>;

	@Field(() => [BuildingProductionRateModel], {
		description:
			'Production rate for single entity. There is possibility that single entity can produce more than one resource.',
		nullable: true,
	})
	@ValidateNested()
	@ValidatePromise()
	@IsOptional()
	@OneToMany(
		() => BuildingProductionRateModel,
		productionRate => productionRate.buildingDetails,
		{
			lazy: true,
			nullable: true,
			persistence: false,
			cascade: true,
		},
	)
	@Type(() => BuildingProductionRateModel)
	public productionRate?:
		| BuildingProductionRateModel[]
		| Promise<BuildingProductionRateModel[]>
		| null;

	@Field(() => [WarehouseDetailsModel], {
		description: 'Resources stored by this level of building',
		nullable: true,
	})
	@ValidateNested()
	@ValidatePromise()
	@IsOptional()
	@OneToMany(
		() => WarehouseDetailsModel,
		requirement => requirement.buildingDetails,
		{
			lazy: true,
			nullable: true,
			persistence: false,
			cascade: true,
		},
	)
	@Type(() => WarehouseDetailsModel)
	public warehouse?:
		| WarehouseDetailsModel[]
		| Promise<WarehouseDetailsModel[]>
		| null;

	@BeforeInsert()
	@BeforeUpdate()
	public async setOneToManyRelationsForBuildingDetails(): Promise<void> {
		const productionRates = (await this.productionRate) ?? [];
		for (const productionRate of productionRates) {
			if (!(await productionRate.buildingDetails)) {
				productionRate.buildingDetails = this;
			}
		}

		const warehouse = (await this.warehouse) ?? [];
		for (const singleWarehouseDetail of warehouse) {
			if (!(await singleWarehouseDetail.buildingDetails)) {
				singleWarehouseDetail.buildingDetails = this;
			}
		}
	}
}
