import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';
import {DateTime} from 'luxon';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {BuildingModel} from '@warp-core/database/model/building.model';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {ResourceModel} from '@warp-core/database/model/resource.model';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {HabitatResourceRepository} from '@warp-core/database/repository/habitat-resource.repository';
import {ResourceCalculatorService} from '@warp-core/user/resources/calculate/resource-calculator.service';
import {CalculateResourceStorageService} from '@warp-core/user/resources/calculate/warehouse-storage/calculate-resource-storage.service';
import {default as multipleBuildingZonesAndSingleResourceCases} from '@warp-core/user/resources/datasets/calculate/multiple-building-zones-and-single-resource';
import {default as singleBuildingZonesAndOneResourceCases} from '@warp-core/user/resources/datasets/calculate/single-building-zone-and-single-resource';
import {default as singleBuildingZonesAndOneResourceCasesWithWarehouseLimit} from '@warp-core/user/resources/datasets/calculate/single-building-zone-and-single-resource-with-warehouse-limit';

jest.mock('@warp-core/database/repository/habitat-resource.repository');
jest.mock('@warp-core/database/repository/building-zone.repository');
jest.mock(
	'@warp-core/user/resources/calculate/warehouse-storage/calculate-resource-storage.service',
);

describe('Resources calculator service test', () => {
	let resourcesCalculator: ResourceCalculatorService;
	let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;
	let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
	let calculateResourceStorage: jest.Mocked<CalculateResourceStorageService>;
	let authorizedHabitatModel: jest.Mocked<AuthorizedHabitatModel>;

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ResourceCalculatorService,
				HabitatResourceRepository,
				BuildingZoneRepository,
				CalculateResourceStorageService,
				AuthorizedHabitatModel,
			],
		}).compile();

		resourcesCalculator = module.get<ResourceCalculatorService>(
			ResourceCalculatorService,
		);
		habitatResourceRepository = module.get(HabitatResourceRepository);
		buildingZoneRepository = module.get(BuildingZoneRepository);
		calculateResourceStorage = module.get(CalculateResourceStorageService);
		authorizedHabitatModel = module.get(AuthorizedHabitatModel);

		when(calculateResourceStorage.calculateStorage).defaultResolvedValue(
			Number.MAX_VALUE,
		);
	});

	describe('calculateSingleResource', () => {
		it('should not calculate any resource when there are no building zones for provided resource', async () => {
			const habitatResource = {
				id: '1',
				currentAmount: 0,
				resource: {
					id: 'different resource',
				},
			} as HabitatResourceModel;

			authorizedHabitatModel.id = 5;

			when(buildingZoneRepository.getBuildingZoneProducersForSingleResource)
				.expectCalledWith(
					authorizedHabitatModel,
					await habitatResource.resource,
				)
				.mockResolvedValue([]);

			await resourcesCalculator.calculateSingleResource(habitatResource);

			expect(habitatResource.currentAmount).toEqual(0);
		});

		describe.each(singleBuildingZonesAndOneResourceCases)(
			'For single buildingZone and one resource',
			buildingZoneResource => {
				it(`should calculate resources amount with production rate ${buildingZoneResource.productionRate} for ${buildingZoneResource.secondsToCalculate}s`, async () => {
					const habitatResource = {
						id: '1',
						currentAmount: buildingZoneResource.currentAmount,
						lastCalculationTime: DateTime.now()
							.minus({second: buildingZoneResource.secondsToCalculate})
							.toJSDate(),
						resource: {
							id: 'wood',
						},
					} as HabitatResourceModel;

					const buildingZone = {
						id: 1,
						level: 1,
						building: {
							buildingDetailsAtCertainLevel: [
								{
									level: 1,
									productionRate: [
										{
											productionRate: buildingZoneResource.productionRate,
										},
									],
								},
							],
						},
					} as BuildingZoneModel;

					authorizedHabitatModel.id = 5;

					when(buildingZoneRepository.getBuildingZoneProducersForSingleResource)
						.expectCalledWith(
							authorizedHabitatModel,
							await habitatResource.resource,
						)
						.mockResolvedValue([buildingZone]);

					await resourcesCalculator.calculateSingleResource(habitatResource);

					expect(habitatResource.currentAmount).toEqual(
						buildingZoneResource.result,
					);
				});
			},
		);
		describe.each(singleBuildingZonesAndOneResourceCasesWithWarehouseLimit)(
			'For single buildingZone and one resource with warehouse limit',
			buildingZoneResource => {
				it(`should calculate resources amount with production rate ${buildingZoneResource.productionRate} for ${buildingZoneResource.secondsToCalculate}s limited by ${buildingZoneResource.warehouseLimit} units`, async () => {
					const habitatResource = {
						id: '1',
						currentAmount: buildingZoneResource.currentAmount,
						lastCalculationTime: DateTime.now()
							.minus({second: buildingZoneResource.secondsToCalculate})
							.toJSDate(),
						resource: {
							id: 'wood',
						},
					} as HabitatResourceModel;

					const buildingZone = {
						id: 1,
						level: 1,
						building: {
							buildingDetailsAtCertainLevel: [
								{
									level: 1,
									productionRate: [
										{
											productionRate: buildingZoneResource.productionRate,
										},
									],
								},
							],
						},
					} as BuildingZoneModel;

					authorizedHabitatModel.id = 5;

					when(calculateResourceStorage.calculateStorage)
						.calledWith(habitatResource.resource as ResourceModel)
						.mockResolvedValue(buildingZoneResource.warehouseLimit);

					when(buildingZoneRepository.getBuildingZoneProducersForSingleResource)
						.expectCalledWith(
							authorizedHabitatModel,
							await habitatResource.resource,
						)
						.mockResolvedValue([buildingZone]);

					await resourcesCalculator.calculateSingleResource(habitatResource);

					expect(habitatResource.currentAmount).toEqual(
						buildingZoneResource.result,
					);
				});
			},
		);

		describe.each(multipleBuildingZonesAndSingleResourceCases)(
			'For multiple buildingZones and one resource',
			buildingZoneResource => {
				it(`should calculate resources amount for multiple building zones`, async () => {
					const habitatResource = {
						id: '1',
						currentAmount: buildingZoneResource.currentAmount,
						lastCalculationTime: DateTime.now()
							.minus({second: buildingZoneResource.secondsToCalculate})
							.toJSDate(),
						resource: {
							id: 'stone',
						},
					} as HabitatResourceModel;

					const buildingZones = buildingZoneResource.buildingZones.map(
						(buildingZoneDetails, index) => {
							return {
								id: index,
								level: 1,
								building: {
									buildingDetailsAtCertainLevel: [
										{
											level: 1,
											productionRate: [
												{
													productionRate: buildingZoneDetails.productionRate,
												},
											],
										},
									],
								},
							} as BuildingZoneModel;
						},
					);

					authorizedHabitatModel.id = 5;

					when(buildingZoneRepository.getBuildingZoneProducersForSingleResource)
						.expectCalledWith(
							authorizedHabitatModel,
							await habitatResource.resource,
						)
						.mockResolvedValue(buildingZones);

					await resourcesCalculator.calculateSingleResource(habitatResource);

					expect(habitatResource.currentAmount).toEqual(
						buildingZoneResource.result,
					);
				});
			},
		);
	});

	describe('calculateOnQueueUpdate', () => {
		it('should update resource on queue update for building zone with single resource', async () => {
			const secondsToCalculate = 10;
			const lastCalculationTime = DateTime.now()
				.minus({second: secondsToCalculate})
				.toJSDate();
			const queueElement = {
				startLevel: 1,
				endLevel: 2,
				endTime: new Date(),
				building: {
					id: 'test',
				},
			} as BuildingQueueElementModel;

			const habitatResource = {
				id: '1',
				currentAmount: 10,
				lastCalculationTime: lastCalculationTime,
				resource: {
					id: 'wood',
				},
			} as HabitatResourceModel;

			const buildingZone = {
				id: 1,
				level: 1,
				building: {
					buildingDetailsAtCertainLevel: [
						{
							level: 1,
							productionRate: [
								{
									productionRate: 1,
								},
							],
						},
					],
				},
			} as BuildingZoneModel;

			authorizedHabitatModel.id = 5;

			when(habitatResourceRepository.getHabitatResourceByBuildingAndLevel)
				.expectCalledWith(
					(await queueElement.building) as BuildingModel,
					queueElement.startLevel,
					authorizedHabitatModel.id,
				)
				.mockResolvedValue([habitatResource]);

			when(buildingZoneRepository.getBuildingZoneProducersForSingleResource)
				.expectCalledWith(
					authorizedHabitatModel,
					await habitatResource.resource,
				)
				.mockResolvedValue([buildingZone]);

			await resourcesCalculator.addResourcesOnQueueUpdate({
				queueElement: queueElement,
			});

			expect(habitatResource.currentAmount).toEqual(20);
			expect(habitatResource.lastCalculationTime!.getTime()).toBeGreaterThan(
				lastCalculationTime.getTime(),
			);

			expect(habitatResourceRepository.save).toBeCalledTimes(1);
		});

		it('should update resource on queue update for building zone with multiple resources', async () => {
			const secondsToCalculate = 10;
			const lastCalculationTime = DateTime.now()
				.minus({second: secondsToCalculate})
				.toJSDate();
			const queueElement = {
				startLevel: 1,
				endLevel: 2,
				endTime: new Date(),
				building: {
					id: 'test',
				},
			} as BuildingQueueElementModel;

			const habitatResource1 = {
				id: '1',
				currentAmount: 10,
				lastCalculationTime: lastCalculationTime,
				resource: {
					id: 'wood',
				},
			} as HabitatResourceModel;

			const habitatResource2 = {
				id: '1',
				currentAmount: 5,
				lastCalculationTime: lastCalculationTime,
				resource: {
					id: 'steel',
				},
			} as HabitatResourceModel;

			const buildingZoneForWood = {
				id: 1,
				level: 1,
				building: {
					buildingDetailsAtCertainLevel: [
						{
							level: 1,
							productionRate: [
								{
									productionRate: 1,
									resourceId: 'wood',
								},
							],
						},
					],
				},
			} as BuildingZoneModel;

			const buildingZoneForSteel = {
				id: 1,
				level: 1,
				building: {
					buildingDetailsAtCertainLevel: [
						{
							level: 1,
							productionRate: [
								{
									productionRate: 0.5,
									resourceId: 'steel',
								},
							],
						},
					],
				},
			} as BuildingZoneModel;

			authorizedHabitatModel.id = 5;

			when(habitatResourceRepository.getHabitatResourceByBuildingAndLevel)
				.expectCalledWith(
					(await queueElement.building) as BuildingModel,
					queueElement.startLevel,
					authorizedHabitatModel.id,
				)
				.mockResolvedValue([habitatResource1, habitatResource2]);

			when(buildingZoneRepository.getBuildingZoneProducersForSingleResource)
				.calledWith(authorizedHabitatModel, await habitatResource1.resource)
				.mockResolvedValue([buildingZoneForWood])
				.calledWith(authorizedHabitatModel, await habitatResource2.resource)
				.mockResolvedValue([buildingZoneForSteel]);

			await resourcesCalculator.addResourcesOnQueueUpdate({
				queueElement: queueElement,
			});

			expect(habitatResource1.currentAmount).toEqual(20);
			expect(habitatResource2.currentAmount).toEqual(10);
			expect(habitatResource1.lastCalculationTime!.getTime()).toBeGreaterThan(
				lastCalculationTime.getTime(),
			);
			expect(habitatResource2.lastCalculationTime!.getTime()).toBeGreaterThan(
				lastCalculationTime.getTime(),
			);

			expect(habitatResourceRepository.save).toBeCalledTimes(1);
		});
	});
});
