import {Field, Float, Int, ObjectType} from '@nestjs/graphql';

import {ResourceTypeEnum} from '@warp-core/database/enum/resource-type.enum';
import {StorageTypeEnum} from '@warp-core/database/enum/storage-type.enum';

@ObjectType({
	description:
		'Effective production of a single resource, summed from all capability sources',
})
export class CalculatedProductionCapabilityModel {
	@Field(() => String, {description: 'Id of produced resource'})
	public resourceId: string;

	@Field(() => Float, {description: 'Amount produced per interval'})
	public amount: number;

	@Field(() => Int, {description: 'Production interval in seconds'})
	public interval: number;

	@Field(() => Float, {description: 'Amount produced every second'})
	public amountPerSecond: number;
}

@ObjectType({
	description:
		'Effective storage entry, summed from all capability sources with the same storage rules',
})
export class CalculatedStorageCapabilityModel {
	@Field(() => StorageTypeEnum, {description: 'What type of storage is it?'})
	public storageType: StorageTypeEnum;

	@Field(() => ResourceTypeEnum, {
		description: 'What kind of resource can be hold in here?',
		nullable: true,
	})
	public resourceType?: ResourceTypeEnum | null;

	@Field(() => String, {
		description: 'Id of the only resource that can be stored here',
		nullable: true,
	})
	public resourceId?: string | null;

	@Field(() => Float, {description: 'Amount of resources stored here'})
	public amount: number;
}

@ObjectType({
	description:
		'Effective capabilities calculated from global blueprint at certain level and player blueprint bonuses',
})
export class CalculatedCapabilitiesModel {
	@Field(() => [CalculatedProductionCapabilityModel], {
		description: 'Effective production, one entry per resource',
	})
	public production: CalculatedProductionCapabilityModel[] = [];

	@Field(() => [CalculatedStorageCapabilityModel], {
		description: 'Effective storage entries',
	})
	public storage: CalculatedStorageCapabilityModel[] = [];
}
