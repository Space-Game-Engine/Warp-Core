import {Field, Float, Int, ObjectType} from '@nestjs/graphql';

import {CapabilityTargetTypeEnum} from '@warp-core/database/enum/capability-target-type.enum';
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
	description: 'Effective movement speed on a single movement layer',
})
export class CalculatedMovementCapabilityModel {
	@Field(() => String, {description: 'Movement layer'})
	public layer: string;

	@Field(() => Float, {description: 'Summed speed on that layer'})
	public speed: number;
}

@ObjectType({description: 'Effective target of attack or healing capability'})
export class CalculatedCapabilityTargetModel {
	@Field(() => CapabilityTargetTypeEnum, {
		description: 'Says how to read the value',
	})
	public type: CapabilityTargetTypeEnum;

	@Field({description: 'Unit id, tag name or movement layer id'})
	public value: string;
}

@ObjectType({description: 'Effective attack, summed from all sources'})
export class CalculatedAttackCapabilityModel {
	@Field(() => Float, {description: 'Damage done by a single attack'})
	public damage: number;

	@Field(() => Int, {description: 'Cooldown between attacks in seconds'})
	public cooldown: number;

	@Field(() => [CalculatedCapabilityTargetModel], {
		description: 'Targets that can be attacked',
	})
	public targets: CalculatedCapabilityTargetModel[];
}

@ObjectType({description: 'Effective defense, summed from all sources'})
export class CalculatedDefenseCapabilityModel {
	@Field(() => Float, {description: 'Summed armor'})
	public armor: number;
}

@ObjectType({description: 'Effective construction, merged from all sources'})
export class CalculatedConstructionCapabilityModel {
	@Field(() => [String], {description: 'Ids of units that can be built'})
	public buildableUnitIds: string[];
}

@ObjectType({description: 'Effective healing, summed from all sources'})
export class CalculatedHealingCapabilityModel {
	@Field(() => Float, {description: 'Amount of HP healed in every interval'})
	public amount: number;

	@Field(() => Int, {description: 'Healing interval in seconds'})
	public interval: number;

	@Field(() => Float, {description: 'Amount of HP healed every second'})
	public amountPerSecond: number;

	@Field(() => [CalculatedCapabilityTargetModel], {
		description: 'Targets that can be healed',
	})
	public targets: CalculatedCapabilityTargetModel[];
}

@ObjectType({description: 'Effective detection, summed from all sources'})
export class CalculatedDetectionCapabilityModel {
	@Field(() => Float, {description: 'Summed range of sight'})
	public sightRange: number;

	@Field({description: 'Is any source able to detect stealth units?'})
	public detectsStealth: boolean;
}

@ObjectType({description: 'Effective stealth, summed from all sources'})
export class CalculatedStealthCapabilityModel {
	@Field(() => Int, {description: 'Summed stealth level'})
	public level: number;
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

	@Field(() => [CalculatedMovementCapabilityModel], {
		description: 'Effective movement, one entry per layer',
	})
	public movement: CalculatedMovementCapabilityModel[] = [];

	@Field(() => CalculatedAttackCapabilityModel, {nullable: true})
	public attack: CalculatedAttackCapabilityModel | null = null;

	@Field(() => CalculatedDefenseCapabilityModel, {nullable: true})
	public defense: CalculatedDefenseCapabilityModel | null = null;

	@Field(() => CalculatedConstructionCapabilityModel, {nullable: true})
	public construction: CalculatedConstructionCapabilityModel | null = null;

	@Field(() => CalculatedHealingCapabilityModel, {nullable: true})
	public healing: CalculatedHealingCapabilityModel | null = null;

	@Field(() => CalculatedDetectionCapabilityModel, {nullable: true})
	public detection: CalculatedDetectionCapabilityModel | null = null;

	@Field(() => CalculatedStealthCapabilityModel, {nullable: true})
	public stealth: CalculatedStealthCapabilityModel | null = null;
}
