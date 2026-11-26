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
		expect(result.attack).toBeNull();
		expect(result.defense).toBeNull();
		expect(result.construction).toBeNull();
		expect(result.healing).toBeNull();
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

	it('should sum damage, use shortest positive cooldown and merge targets when attack comes from many sources', async () => {
		const target = {type: CapabilityTargetTypeEnum.TAG, value: 'infantry'};
		const result = await service.sum(
			sources(
				{attack: {damage: 10, cooldown: 4, targets: [target]}},
				{
					attack: {
						damage: 2,
						cooldown: 0,
						targets: [
							target,
							{type: CapabilityTargetTypeEnum.UNIT, value: 'tank'},
						],
					},
				},
			),
		);

		expect(result.attack).toEqual({
			damage: 12,
			cooldown: 4,
			targets: [target, {type: CapabilityTargetTypeEnum.UNIT, value: 'tank'}],
		});
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

	it('should rescale healing to first interval and merge targets', async () => {
		const target = {type: CapabilityTargetTypeEnum.TAG, value: 'infantry'};
		const result = await service.sum(
			sources(
				{healing: {amount: 1, interval: 1, targets: [target]}},
				{healing: {amount: 1, interval: 2, targets: [target]}},
			),
		);

		expect(result.healing).toEqual({
			amount: 1.5,
			interval: 1,
			amountPerSecond: 1.5,
			targets: [target],
		});
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
