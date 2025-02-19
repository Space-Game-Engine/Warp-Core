import {Field, ID, Int, ObjectType} from '@nestjs/graphql';
import {Type} from 'class-transformer';
import {
	IsNumber,
	IsOptional,
	Min,
	ValidateNested,
	ValidatePromise,
} from 'class-validator';
import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {BuildingProductionRateModel} from '@warp-core/database/model/building-production-rate.model';
import {BuildingRequirementsModel} from '@warp-core/database/model/building-requirements.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {WarehouseDetailsModel} from '@warp-core/database/model/warehouse-details.model';

@ObjectType({description: 'Details how to upgrade single building'})
@Entity({name: 'building-details-at-certain-level'})
export class BuildingDetailsAtCertainLevelModel {
	@Field(() => ID)
	@PrimaryGeneratedColumn()
	public id: number;

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

	@Field(() => Int, {description: 'What level is described by this entry'})
	@IsNumber()
	@Min(1)
	@Column('int')
	public level: number;

	@Field(() => Int, {
		description: 'How much time it takes to upgrade that building',
	})
	@IsNumber()
	@Min(1)
	@Column('int')
	public timeToUpdateBuildingInSeconds: number;

	@Field(() => [BuildingProductionRateModel], {
		description:
			'Production rate for single building. There is possibility that single building can produce more than one resource.',
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

	@Field(() => [BuildingRequirementsModel], {
		description:
			'Requirements to upgrade for specified level. Nothing comes for free.',
		nullable: true,
	})
	@ValidateNested()
	@ValidatePromise()
	@IsOptional()
	@OneToMany(
		() => BuildingRequirementsModel,
		requirement => requirement.buildingDetails,
		{
			lazy: true,
			nullable: true,
			persistence: false,
			cascade: true,
		},
	)
	@Type(() => BuildingRequirementsModel)
	public requirements?:
		| BuildingRequirementsModel[]
		| Promise<BuildingRequirementsModel[]>
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
	public async setOneToManyRelations(): Promise<void> {
		const productionRates = (await this.productionRate) ?? [];
		for (const productionRate of productionRates) {
			if (!(await productionRate.buildingDetails)) {
				productionRate.buildingDetails = this;
			}
		}

		const requirements = (await this.requirements) ?? [];
		for (const requirement of requirements) {
			if (!(await requirement.buildingDetails)) {
				requirement.buildingDetails = this;
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
