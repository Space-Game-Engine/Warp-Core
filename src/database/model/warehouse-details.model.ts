import {Field, ObjectType} from '@nestjs/graphql';
import {IsEnum, IsNotEmpty, IsNumber, ValidateIf} from 'class-validator';
import {BeforeInsert, Column, Entity, JoinColumn, ManyToOne} from 'typeorm';

import {ResourceTypeEnum, WarehouseTypeEnum} from '@warp-core/database/enum';
import {ResourceModel} from '@warp-core/database/model';
import {AbstractDetailsAtCertainLevelModel} from '@warp-core/database/model/abstracts/details-at-certain-level.abstract-model';

@ObjectType({description: 'Stores resources and other stuff'})
@Entity({name: 'warehouse-details'})
export class WarehouseDetailsModel extends AbstractDetailsAtCertainLevelModel {
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
