import {Field, InterfaceType} from '@nestjs/graphql';
import {IsNumber, IsOptional, ValidateNested} from 'class-validator';
import {ManyToOne, PrimaryGeneratedColumn} from 'typeorm';

import {BuildingDetailsAtCertainLevelModel} from '@warp-core/database';

@InterfaceType()
export abstract class AbstractDetailsAtCertainLevelModel {
	@PrimaryGeneratedColumn()
	@IsNumber()
	@IsOptional()
	public id: number;

	@Field(() => BuildingDetailsAtCertainLevelModel, {
		description: 'Details how to upgrade that building',
	})
	@ValidateNested()
	@ManyToOne(
		() => BuildingDetailsAtCertainLevelModel,
		buildingDetails => buildingDetails.productionRate,
		{
			lazy: true,
		},
	)
	public buildingDetails:
		| BuildingDetailsAtCertainLevelModel
		| Promise<BuildingDetailsAtCertainLevelModel>;
}
