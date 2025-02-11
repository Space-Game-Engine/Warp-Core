import {Field, ObjectType} from '@nestjs/graphql';
import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	ValidateIf,
	ValidateNested,
} from 'class-validator';
import {
	BeforeInsert,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {ResourceTypeEnum} from '@warp-core/database/enum/resource-type.enum';
import {WarehouseTypeEnum} from '@warp-core/database/enum/warehouse-type.enum';
import {BuildingDetailsAtCertainLevelModel} from '@warp-core/database/model/building-details-at-certain-level.model';
import {ResourceModel} from '@warp-core/database/model/resource.model';

@ObjectType({description: 'Stores resources and other stuff'})
@Entity({name: 'warehouse-details'})
export class WarehouseDetailsModel {
	@PrimaryGeneratedColumn()
	@IsNumber()
	@IsOptional()
	public id: number;

	@Field(() => WarehouseTypeEnum, {
		description: 'What type of warehouse is it?',
	})
	@IsEnum(WarehouseTypeEnum)
	@Column('varchar')
	public warehouseType: WarehouseTypeEnum;

	@Field(() => ResourceModel, {
		description: 'Get connected resource details',
		nullable: true,
	})
	@ManyToOne(() => ResourceModel, {
		lazy: true,
		nullable: true,
	})
	@JoinColumn({name: 'resourceId'})
	public resource?: ResourceModel | Promise<ResourceModel> | null;

	@Column({name: 'resourceId', nullable: true})
	@ValidateIf(
		(details: WarehouseDetailsModel) =>
			details.warehouseType === WarehouseTypeEnum.ONE_KIND_OF_RESOURCE,
	)
	@IsNotEmpty()
	public resourceId?: string | null;

	@Field(() => ResourceTypeEnum, {
		description: 'What kind of resource can be hold in here?',
		nullable: true,
	})
	@ValidateIf(
		(details: WarehouseDetailsModel) =>
			details.warehouseType === WarehouseTypeEnum.ONE_TYPE_OF_RESOURCE,
	)
	@IsNotEmpty()
	@IsEnum(ResourceTypeEnum)
	@Column('varchar', {nullable: true})
	public resourceType?: ResourceTypeEnum | null;

	@Field({description: 'Amount of resources stored here'})
	@IsNumber()
	@Column()
	public amount: number;

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

	@BeforeInsert()
	public validateWarehouseDetails(): void {
		switch (this.warehouseType) {
			case WarehouseTypeEnum.ONE_TYPE_OF_RESOURCE:
				if (!this.resourceType) {
					throw new Error(
						`resourceType field is required in WarehouseDetailsModel when "${WarehouseTypeEnum.ONE_TYPE_OF_RESOURCE}" is set`,
					);
				}
				break;
			case WarehouseTypeEnum.ONE_KIND_OF_RESOURCE:
				if (!this.resourceId || !this.resource) {
					throw new Error(
						`resource field is required in WarehouseDetailsModel when "${WarehouseTypeEnum.ONE_KIND_OF_RESOURCE}" is set`,
					);
				}
		}
	}

	public isWarehouseLinkedToResource(resource: ResourceModel): boolean {
		switch (this.warehouseType) {
			case WarehouseTypeEnum.ANY_RESOURCE:
				return true;
			case WarehouseTypeEnum.ONE_TYPE_OF_RESOURCE:
				return resource.type === this.resourceType;
			case WarehouseTypeEnum.ONE_KIND_OF_RESOURCE:
				return resource.id === this.resourceId;
			default:
				return false;
		}
	}
}
