import {AttackCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/attack-capability.aggregator';
import {ConstructionCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/construction-capability.aggregator';
import {DefenseCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/defense-capability.aggregator';
import {DetectionCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/detection-capability.aggregator';
import {HealingCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/healing-capability.aggregator';
import {MovementCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/movement-capability.aggregator';
import {StealthCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/stealth-capability.aggregator';
import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {SumCapabilitiesService} from '@warp-core/core/utils/capabilities/sum-capabilities.service';
import {CapabilityTargetTypeEnum} from '@warp-core/database/enum/capability-target-type.enum';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

function sources(...input: object[]): CapabilitiesModel[] {
	return input as unknown as CapabilitiesModel[];
}

describe('Unit capability aggregators', () => {
	const service = new SumCapabilitiesService([
		new MovementCapabilityAggregator(),
		new AttackCapabilityAggregator(),
		new DefenseCapabilityAggregator(),
		new ConstructionCapabilityAggregator(),
		new HealingCapabilityAggregator(),
		new DetectionCapabilityAggregator(),
		new StealthCapabilityAggregator(),
	] as CapabilityAggregatorInterface<unknown>[]);

	it('should leave single capabilities empty when no source provides them', async () => {
		const result = await service.sum(sources({}));

		expect(result.movement).toEqual([]);
		expect(result.attack).toEqual([]);
		expect(result.defense).toBeNull();
		expect(result.construction).toBeNull();
		expect(result.healing).toEqual([]);
		expect(result.detection).toBeNull();
		expect(result.stealth).toBeNull();
	});

	it('should sum speed per movement layer', async () => {
		const result = await service.sum(
			sources(
				{
					movement: [
						{layer: 'land', speed: 2},
						{layer: 'air', speed: 5},
					],
				},
				{movement: [{layer: 'land', speed: 1}]},
			),
		);

		expect(result.movement).toEqual([
			{layer: 'land', speed: 3},
			{layer: 'air', speed: 5},
		]);
	});

	it('should sum damage and cooldown per target and add targets that exist only in later sources when attack comes from many sources', async () => {
		const result = await service.sum(
			sources(
				{
					attack: [
						{
							targetType: CapabilityTargetTypeEnum.TAG,
							targetValue: 'plane',
							damage: 10,
							cooldown: 4,
						},
					],
				},
				{
					attack: [
						{
							targetType: CapabilityTargetTypeEnum.TAG,
							targetValue: 'plane',
							damage: 2,
							cooldown: -1,
						},
						{
							targetType: CapabilityTargetTypeEnum.TAG,
							targetValue: 'tank',
							damage: 5,
							cooldown: 3,
						},
					],
				},
			),
		);

		expect(result.attack).toEqual([
			{
				targetType: CapabilityTargetTypeEnum.TAG,
				targetValue: 'plane',
				damage: 12,
				cooldown: 3,
			},
			{
				targetType: CapabilityTargetTypeEnum.TAG,
				targetValue: 'tank',
				damage: 5,
				cooldown: 3,
			},
		]);
	});

	it('should sum armor and stealth level', async () => {
		const result = await service.sum(
			sources(
				{defense: {armor: 3}, stealth: {level: 1}},
				{defense: {armor: 1.5}, stealth: {level: 2}},
			),
		);

		expect(result.defense).toEqual({armor: 4.5});
		expect(result.stealth).toEqual({level: 3});
	});

	it('should merge buildable units without duplicates', async () => {
		const result = await service.sum(
			sources(
				{
					construction: {
						buildableUnits: [{unitBlueprintId: 'a'}, {unitBlueprintId: 'b'}],
					},
				},
				{construction: {buildableUnits: [{unitBlueprintId: 'b'}]}},
			),
		);

		expect(result.construction).toEqual({buildableUnitIds: ['a', 'b']});
	});

	it('should sum amount and interval per target when healing comes from many sources', async () => {
		const turret = {
			targetType: CapabilityTargetTypeEnum.TAG,
			targetValue: 'turret',
		};
		const result = await service.sum(
			sources(
				{
					healing: [
						{...turret, amount: 10, interval: 15},
						{
							targetType: CapabilityTargetTypeEnum.TAG,
							targetValue: 'infantry',
							amount: 1,
							interval: 5,
						},
					],
				},
				{healing: [{...turret, amount: 5, interval: 2}]},
			),
		);

		expect(result.healing).toEqual([
			{...turret, amount: 15, interval: 17},
			{
				targetType: CapabilityTargetTypeEnum.TAG,
				targetValue: 'infantry',
				amount: 1,
				interval: 5,
			},
		]);
	});

	it('should keep healing interval shorter when a source only changes interval', async () => {
		const unit = {
			targetType: CapabilityTargetTypeEnum.UNIT,
			targetValue: 'tank',
		};
		const result = await service.sum(
			sources(
				{healing: [{...unit, amount: 10, interval: 5}]},
				{healing: [{...unit, amount: 0, interval: -1}]},
			),
		);

		expect(result.healing).toEqual([{...unit, amount: 10, interval: 4}]);
	});

	it('should sum sight range and enable stealth detection when any source does', async () => {
		const result = await service.sum(
			sources(
				{detection: {sightRange: 5, detectsStealth: false}},
				{detection: {sightRange: 2, detectsStealth: true}},
			),
		);

		expect(result.detection).toEqual({sightRange: 7, detectsStealth: true});
	});
});
