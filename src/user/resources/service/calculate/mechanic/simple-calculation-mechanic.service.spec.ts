import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {BuildingDetailsAtCertainLevelModel} from '@warp-core/database/model/building-details-at-certain-level.model';
import {BuildingProductionRateModel} from '@warp-core/database/model/building-production-rate.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {HabitatModel} from '@warp-core/database/model/habitat.model';
import {ResourceModel} from '@warp-core/database/model/resource.model';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {SimpleCalculationMechanicService} from '@warp-core/user/resources/service/calculate/mechanic/simple-calculation-mechanic.service';

jest.mock('@warp-core/database/repository/habitat-resource.repository');
jest.mock('@warp-core/database/repository/building-zone.repository');
jest.mock(
	'@warp-core/user/resources/service/calculate/warehouse-storage/base-resource-storage.service',
);

const testCases: {
	name: string;
	expectedProductionRate: number;
	expectedResourcesAmount: number;
	parameters: {
		resourceId: string;
		buildingZones: {
			level: number;
			building: {
				buildingDetailsAtCertainLevel: {
					level: number;
					productionRate: {
						productionRate: number;
						resource: {
							id: string;
						};
					}[];
				}[];
			};
		}[];
	};
}[] = [
	{
		name: 'there is single building zone',
		expectedProductionRate: 1,
		expectedResourcesAmount: 100,
		parameters: {
			resourceId: 'wood',
			buildingZones: [
				{
					level: 1,
					building: {
						buildingDetailsAtCertainLevel: [
							{
								level: 1,
								productionRate: [
									{
										productionRate: 1,
										resource: {
											id: 'wood',
										},
									},
								],
							},
						],
					},
				},
			],
		},
	},
	{
		name: 'there are two building zones with different production rates with corresponding building zone levels',
		expectedProductionRate: 1.5,
		expectedResourcesAmount: 150,
		parameters: {
			resourceId: 'wood',
			buildingZones: [
				{
					level: 1,
					building: {
						buildingDetailsAtCertainLevel: [
							{
								level: 1,
								productionRate: [
									{
										productionRate: 1,
										resource: {
											id: 'wood',
										},
									},
								],
							},
						],
					},
				},
				{
					level: 2,
					building: {
						buildingDetailsAtCertainLevel: [
							{
								level: 2,
								productionRate: [
									{
										productionRate: 0.5,
										resource: {
											id: 'wood',
										},
									},
								],
							},
						],
					},
				},
			],
		},
	},
	{
		name: 'there are two building zones with different production rates but second does not have expected level',
		expectedProductionRate: 1,
		expectedResourcesAmount: 100,
		parameters: {
			resourceId: 'wood',
			buildingZones: [
				{
					level: 1,
					building: {
						buildingDetailsAtCertainLevel: [
							{
								level: 1,
								productionRate: [
									{
										productionRate: 1,
										resource: {
											id: 'wood',
										},
									},
								],
							},
						],
					},
				},
				{
					level: 3,
					building: {
						buildingDetailsAtCertainLevel: [
							{
								level: 1,
								productionRate: [
									{
										productionRate: 0.25,
										resource: {
											id: 'wood',
										},
									},
								],
							},
							{
								level: 2,
								productionRate: [
									{
										productionRate: 0.5,
										resource: {
											id: 'wood',
										},
									},
								],
							},
						],
					},
				},
			],
		},
	},
];

describe.each(testCases)(
	'Simple resources calculator mechanic service test',
	singleTestCase => {
		let resourcesCalculator: SimpleCalculationMechanicService;
		let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;

		let habitatResource: HabitatResourceModel;

		beforeEach(async () => {
			jest.clearAllMocks();
			const module: TestingModule = await Test.createTestingModule({
				providers: [SimpleCalculationMechanicService, BuildingZoneRepository],
			}).compile();

			resourcesCalculator = module.get<SimpleCalculationMechanicService>(
				SimpleCalculationMechanicService,
			);
			buildingZoneRepository = module.get(BuildingZoneRepository);

			const parameters = singleTestCase.parameters;
			const habitat = {} as HabitatModel;
			const resource = {
				id: parameters.resourceId,
			} as ResourceModel;
			habitatResource = {
				resource,
				resourceId: parameters.resourceId,
				currentAmount: 0,
				habitat,
			} as HabitatResourceModel;

			const buildingZones = parameters.buildingZones.map(singleBuildingZone => {
				return {
					level: singleBuildingZone.level,
					building: {
						buildingDetailsAtCertainLevel:
							singleBuildingZone.building.buildingDetailsAtCertainLevel.map(
								levelDetails => {
									return {
										level: levelDetails.level,
										productionRate: levelDetails.productionRate.map(
											parameterProductionRate => {
												return {
													productionRate:
														parameterProductionRate.productionRate,
													resource: {
														id: parameterProductionRate.resource.id,
													},
												};
											},
										) as BuildingProductionRateModel[],
									};
								},
							) as BuildingDetailsAtCertainLevelModel[],
					},
				};
			}) as BuildingZoneModel[];

			when(buildingZoneRepository.getBuildingZoneProducersForSingleResource)
				.expectCalledWith(habitat, resource)
				.mockResolvedValue(buildingZones);
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
				const secondsToCalculateResources = 100;
				const resourceValue =
					await resourcesCalculator.calculateCurrentResourceValue(
						habitatResource,
						secondsToCalculateResources,
					);

				expect(resourceValue).toEqual(singleTestCase.expectedResourcesAmount);
			});
		});
	},
);
