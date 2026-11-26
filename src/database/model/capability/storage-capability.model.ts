import {Field, Float, Int, ObjectType} from '@nestjs/graphql';
import {
	IsEnum,
	IsInt,
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

import {isStorageLinkedToResource} from '@warp-core/core/utils/capabilities/storage-link.util';
import {ResourceTypeEnum} from '@warp-core/database/enum/resource-type.enum';
import {StorageTypeEnum} from '@warp-core/database/enum/storage-type.enum';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {ResourceModel} from '@warp-core/database/model/resource/resource.model';

@ObjectType({
	description: 'Storage capability: what resources and how much can be stored',
})
@Entity({name: 'storage-capability'})
export class StorageCapabilityModel {
	@PrimaryGeneratedColumn()
	@IsNumber()
	@IsOptional()
	public id: number;

	@Field(() => StorageTypeEnum, {
		description: 'What type of storage is it?',
	})
	@IsEnum(StorageTypeEnum)
	@Column('varchar')
	public storageType: StorageTypeEnum;

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

	@Field(() => String, {
		description: 'Id of the only resource that can be stored here',
		nullable: true,
	})
	@Column({name: 'resourceId', nullable: true})
	@ValidateIf(
		(storage: StorageCapabilityModel) =>
			storage.storageType === StorageTypeEnum.ONE_KIND_OF_RESOURCE,
	)
	@IsNotEmpty()
	public resourceId?: string | null;

	@Field(() => ResourceTypeEnum, {
		description: 'What kind of resource can be hold in here?',
		nullable: true,
	})
	@ValidateIf(
		(storage: StorageCapabilityModel) =>
			storage.storageType === StorageTypeEnum.ONE_TYPE_OF_RESOURCE,
	)
	@IsNotEmpty()
	@IsEnum(ResourceTypeEnum)
	@Column('varchar', {nullable: true})
	public resourceType?: ResourceTypeEnum | null;

	@Field(() => Float, {description: 'Amount of resources stored here'})
	@IsNumber()
	@Column({type: 'float', precision: 10, scale: 4})
	public amount: number;

	@Field(() => Int, {
		description: 'How many units can be carried in that storage',
	})
	@IsInt()
	@Column('int', {default: 0})
	public carriesUnits: number = 0;

	@Field(() => CapabilitiesModel, {
		description: 'Capabilities set that storage belongs to',
	})
	@ValidateNested()
	@ManyToOne(() => CapabilitiesModel, capabilities => capabilities.storage, {
		lazy: true,
	})
	@JoinColumn({name: 'capabilitiesId'})
	public capabilities: CapabilitiesModel | Promise<CapabilitiesModel>;

	@BeforeInsert()
	public validateStorageCapability(): void {
		switch (this.storageType) {
			case StorageTypeEnum.ONE_TYPE_OF_RESOURCE:
				if (!this.resourceType) {
					throw new Error(
						`resourceType field is required in StorageCapabilityModel when "${StorageTypeEnum.ONE_TYPE_OF_RESOURCE}" is set`,
					);
				}
				break;
			case StorageTypeEnum.ONE_KIND_OF_RESOURCE:
				if (!this.resourceId) {
					throw new Error(
						`resourceId field is required in StorageCapabilityModel when "${StorageTypeEnum.ONE_KIND_OF_RESOURCE}" is set`,
					);
				}
		}
	}

	public isStorageLinkedToResource(resource: ResourceModel): boolean {
		return isStorageLinkedToResource(this, resource);
	}
}
