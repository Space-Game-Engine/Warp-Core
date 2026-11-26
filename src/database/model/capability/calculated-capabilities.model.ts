import {Field, ObjectType, PickType} from '@nestjs/graphql';

import {AttackCapabilityModel} from '@warp-core/database/model/capability/attack-capability.model';
import {CapabilityTargetModel} from '@warp-core/database/model/capability/capability-target.model';
import {DefenseCapabilityModel} from '@warp-core/database/model/capability/defense-capability.model';
import {DetectionCapabilityModel} from '@warp-core/database/model/capability/detection-capability.model';
import {HealingCapabilityModel} from '@warp-core/database/model/capability/healing-capability.model';
import {MovementCapabilityModel} from '@warp-core/database/model/capability/movement-capability.model';
import {ProductionCapabilityModel} from '@warp-core/database/model/capability/production-capability.model';
import {StealthCapabilityModel} from '@warp-core/database/model/capability/stealth-capability.model';
import {StorageCapabilityModel} from '@warp-core/database/model/capability/storage-capability.model';

@ObjectType({
	description:
		'Effective production of a single resource, summed from all capability sources',
})
export class CalculatedProductionCapabilityModel extends PickType(
	ProductionCapabilityModel,
	['resourceId', 'amount', 'interval'] as const,
	ObjectType,
) {}

@ObjectType({
	description:
		'Effective storage entry, summed from all capability sources with the same storage rules',
})
export class CalculatedStorageCapabilityModel extends PickType(
	StorageCapabilityModel,
	['storageType', 'resourceType', 'resourceId', 'amount'] as const,
	ObjectType,
) {}

@ObjectType({
	description: 'Effective movement speed on a single movement layer',
})
export class CalculatedMovementCapabilityModel extends PickType(
	MovementCapabilityModel,
	['layer', 'speed'] as const,
	ObjectType,
) {}

@ObjectType({description: 'Effective target of attack or healing capability'})
export class CalculatedCapabilityTargetModel extends PickType(
	CapabilityTargetModel,
	['type', 'value'] as const,
	ObjectType,
) {}

@ObjectType({description: 'Effective attack, summed from all sources'})
export class CalculatedAttackCapabilityModel extends PickType(
	AttackCapabilityModel,
	['damage', 'cooldown'] as const,
	ObjectType,
) {
	@Field(() => [CalculatedCapabilityTargetModel], {
		description: 'Targets that can be attacked',
	})
	public targets: CalculatedCapabilityTargetModel[];
}

@ObjectType({description: 'Effective defense, summed from all sources'})
export class CalculatedDefenseCapabilityModel extends PickType(
	DefenseCapabilityModel,
	['armor'] as const,
	ObjectType,
) {}

@ObjectType({description: 'Effective construction, merged from all sources'})
export class CalculatedConstructionCapabilityModel {
	@Field(() => [String], {description: 'Ids of units that can be built'})
	public buildableUnitIds: string[];
}

@ObjectType({description: 'Effective healing, summed from all sources'})
export class CalculatedHealingCapabilityModel extends PickType(
	HealingCapabilityModel,
	['amount', 'interval'] as const,
	ObjectType,
) {
	@Field(() => [CalculatedCapabilityTargetModel], {
		description: 'Targets that can be healed',
	})
	public targets: CalculatedCapabilityTargetModel[];
}

@ObjectType({description: 'Effective detection, summed from all sources'})
export class CalculatedDetectionCapabilityModel extends PickType(
	DetectionCapabilityModel,
	['sightRange', 'detectsStealth'] as const,
	ObjectType,
) {}

@ObjectType({description: 'Effective stealth, summed from all sources'})
export class CalculatedStealthCapabilityModel extends PickType(
	StealthCapabilityModel,
	['level'] as const,
	ObjectType,
) {}

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
