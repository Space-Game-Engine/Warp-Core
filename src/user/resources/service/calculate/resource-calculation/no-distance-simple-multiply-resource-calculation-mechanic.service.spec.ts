import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {HabitatResourceModel} from '@warp-core/database/model/resource/habitat-resource.model';
import {
	BuildingZoneCapabilities,
	BuildingZoneEmitter,
} from '@warp-core/user/building-zone';
import {NoDistanceSimpleMultiplyResourceCalculationMechanicService} from '@warp-core/user/resources/service/calculate/resource-calculation/no-distance-simple-multiply-resource-calculation-mechanic.service';

jest.mock('@warp-core/user/building-zone/exchange/query/building-zone.emitter');

const testCases: {
	name: string;
	expectedProductionRate: number;
	expectedResourcesAmount: number;
	zonesProduction: {resourceId: string; amountPerSecond: number}[][];
}[] = [
	{
		name: 'there is single building zone',
		expectedProductionRate: 1,
		expectedResourcesAmount: 100,
		zonesProduction: [[{resourceId: 'wood', amountPerSecond: 1}]],
	},
	{
		name: 'there are two building zones producing the same resource',
		expectedProductionRate: 1.5,
		expectedResourcesAmount: 150,
		zonesProduction: [
			[{resourceId: 'wood', amountPerSecond: 1}],
			[{resourceId: 'wood', amountPerSecond: 0.5}],
		],
	},
	{
		name: 'there is a building zone producing another resource',
		expectedProductionRate: 1,
		expectedResourcesAmount: 100,
		zonesProduction: [
			[{resourceId: 'wood', amountPerSecond: 1}],
			[{resourceId: 'coal', amountPerSecond: 0.5}],
		],
	},
	{
		name: 'single building zone produces multiple resources',
		expectedProductionRate: 0.5,
		expectedResourcesAmount: 50,
		zonesProduction: [
			[
				{resourceId: 'coal', amountPerSecond: 2},
				{resourceId: 'wood', amountPerSecond: 0.5},
			],
		],
	},
	{
		name: 'there are no built building zones',
		expectedProductionRate: 0,
		expectedResourcesAmount: 0,
		zonesProduction: [],
	},
];

describe('No distance simple multiply resource calculation mechanic service', () => {
	let resourcesCalculator: NoDistanceSimpleMultiplyResourceCalculationMechanicService;
	let buildingZoneEmitter: jest.Mocked<BuildingZoneEmitter>;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				NoDistanceSimpleMultiplyResourceCalculationMechanicService,
				BuildingZoneEmitter,
			],
		}).compile();

		resourcesCalculator = module.get(
			NoDistanceSimpleMultiplyResourceCalculationMechanicService,
		);
		buildingZoneEmitter = module.get(BuildingZoneEmitter);
	});

	describe.each(testCases)('with calculated capabilities', singleTestCase => {
		let habitatResource: HabitatResourceModel;

		beforeEach(() => {
			habitatResource = {
				resourceId: 'wood',
				habitatId: 3,
				currentAmount: 0,
			} as HabitatResourceModel;

			const zonesCapabilities = singleTestCase.zonesProduction.map(
				production => ({capabilities: {production, storage: []}}),
			) as unknown as BuildingZoneCapabilities[];

			when(buildingZoneEmitter.getCalculatedCapabilitiesForHabitat)
				.expectCalledWith({habitatId: 3})
				.mockResolvedValue({data: zonesCapabilities, error: undefined});
		});

		describe('getProductionRate', () => {
			it(`should return production rate when ${singleTestCase.name}`, async () => {
				const result =
					await resourcesCalculator.getProductionRate(habitatResource);

				expect(result).toEqual(singleTestCase.expectedProductionRate);
			});
		});

		describe('calculateCurrentResourceValue', () => {
			it(`should return resource amount when ${singleTestCase.name}`, async () => {
				const resourceValue =
					await resourcesCalculator.calculateCurrentResourceValue(
						habitatResource,
						100,
					);

				expect(resourceValue).toEqual(singleTestCase.expectedResourcesAmount);
			});
		});
	});

	describe('getProductionRate', () => {
		it('should throw internal emitter error when capabilities cannot be fetched', async () => {
			const habitatResource = {
				resourceId: 'wood',
				habitatId: 3,
			} as HabitatResourceModel;

			when(buildingZoneEmitter.getCalculatedCapabilitiesForHabitat)
				.expectCalledWith({habitatId: 3})
				.mockResolvedValue({
					data: undefined,
					error: {message: 'boom', trace: undefined},
				});

			await expect(
				resourcesCalculator.getProductionRate(habitatResource),
			).rejects.toThrow('boom');
		});
	});
});
