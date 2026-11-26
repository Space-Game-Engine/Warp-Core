import {HttpStatus, INestApplication} from '@nestjs/common';
import {DateTime} from 'luxon';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {StorageTypeEnum} from '@warp-core/database/enum/storage-type.enum';
import {ProductionCapabilityModel} from '@warp-core/database/model/capability/production-capability.model';
import {StorageCapabilityModel} from '@warp-core/database/model/capability/storage-capability.model';
import {BuildingBlueprintPlayerRepository} from '@warp-core/database/repository/building-blueprint-player.repository';
import {HabitatRepository} from '@warp-core/database/repository/habitat.repository';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Building zone capabilities', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	const zoneFields = {
		fields: ['localBuildingZoneId', 'level'],
		building: {fields: ['id']},
		buildingBlueprintPlayer: {fields: ['buildingId']},
		capabilities: {
			production: {
				fields: ['resourceId', 'amount', 'interval'],
			},
			storage: {fields: ['storageType', 'amount']},
		},
	};

	function getZones(): Promise<
		{
			localBuildingZoneId: number;
			level: number;
			building: {id: string} | null;
			buildingBlueprintPlayer: {buildingId: string} | null;
			capabilities: {
				production: {
					resourceId: string;
					amount: number;
					interval: number;
				}[];
				storage: {storageType: string; amount: number}[];
			} | null;
		}[]
	> {
		return requestTest
			.query({root: 'buildingZone_getAll', fields: zoneFields})
			.send()
			.expect(HttpStatus.OK)
			.then(response => response.body.data.buildingZone_getAll);
	}

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		app.get(RuntimeConfig).habitat.onStart.buildings = [
			{id: 'warehouse', level: 1, localBuildingZoneId: 1},
			{id: 'lumber_mill', level: 1, localBuildingZoneId: 2},
		];
		app.get(RuntimeConfig).habitat.onStart.resources = [
			{id: 'wood', amount: 50},
		];

		return requestTest.registerAndAuthenticate(2);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should return global capabilities of current level for built zones and null for empty ones', async () => {
		const zones = await getZones();

		const warehouse = zones.find(zone => zone.localBuildingZoneId === 1)!;
		expect(warehouse.building!.id).toBe('warehouse');
		expect(warehouse.buildingBlueprintPlayer!.buildingId).toBe('warehouse');
		expect(warehouse.capabilities).toEqual({
			production: [],
			storage: [{storageType: 'ANY_RESOURCE', amount: 100}],
		});

		const lumberMill = zones.find(zone => zone.localBuildingZoneId === 2)!;
		expect(lumberMill.capabilities).toEqual({
			production: [{resourceId: 'wood', amount: 1, interval: 1}],
			storage: [],
		});

		const emptyZone = zones.find(zone => zone.localBuildingZoneId === 3)!;
		expect(emptyZone.building).toBeNull();
		expect(emptyZone.buildingBlueprintPlayer).toBeNull();
		expect(emptyZone.capabilities).toBeNull();
	});

	it('should return capabilities of the new level after upgrade from queue is processed', async () => {
		await requestTest
			.mutation({
				root: 'buildingQueue_add',
				operationName: 'AddToQueue',
				fields: {fields: ['id']},
				variables: {
					addToQueue: {
						type: 'AddToQueueInput',
						value: {localBuildingZoneId: 1, endLevel: 2},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		jest
			.useFakeTimers()
			.setSystemTime(DateTime.now().plus({minutes: 5}).toJSDate());

		const zones = await getZones();
		const warehouse = zones.find(zone => zone.localBuildingZoneId === 1)!;

		expect(warehouse.level).toBe(2);
		expect(warehouse.capabilities!.storage).toEqual([
			{storageType: 'ANY_RESOURCE', amount: 200},
		]);
	});

	describe('with player blueprint bonuses', () => {
		beforeEach(async () => {
			const habitat = (
				await app.get(HabitatRepository).getHabitatsByUserId(2)
			)[0];
			const blueprintRepository = app.get(BuildingBlueprintPlayerRepository);
			const lumberMillBlueprint =
				(await blueprintRepository.getForHabitatAndGlobalBlueprint(
					habitat.id,
					'lumber_mill',
				))!;
			const warehouseBlueprint =
				(await blueprintRepository.getForHabitatAndGlobalBlueprint(
					habitat.id,
					'warehouse',
				))!;

			// entities with lazy relations must be created through the repository,
			// otherwise TypeORM does not persist the relation set on them
			lumberMillBlueprint.capabilities.production = [
				blueprintRepository.manager.create(ProductionCapabilityModel, {
					resourceId: 'wood',
					amount: 1,
					interval: 0,
					capabilities: lumberMillBlueprint.capabilities,
				}),
			];
			warehouseBlueprint.capabilities.storage = [
				blueprintRepository.manager.create(StorageCapabilityModel, {
					storageType: StorageTypeEnum.ANY_RESOURCE,
					amount: 50,
					capabilities: warehouseBlueprint.capabilities,
				}),
			];

			await blueprintRepository.save([lumberMillBlueprint, warehouseBlueprint]);
		});

		it('should sum player bonuses with global capabilities', async () => {
			const zones = await getZones();

			const lumberMill = zones.find(zone => zone.localBuildingZoneId === 2)!;
			expect(lumberMill.capabilities!.production).toEqual([
				{resourceId: 'wood', amount: 2, interval: 1},
			]);

			const warehouse = zones.find(zone => zone.localBuildingZoneId === 1)!;
			expect(warehouse.capabilities!.storage).toEqual([
				{storageType: 'ANY_RESOURCE', amount: 150},
			]);
		});

		it('should use summed production and storage in resource calculations', async () => {
			const productionResponse = await requestTest
				.query({
					root: 'resource_get',
					fields: {fields: ['id', 'productionRate']},
					variables: {id: {value: 'wood', type: 'ID'}},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(productionResponse.body.data.resource_get.productionRate).toBe(2);

			jest
				.useFakeTimers()
				.setSystemTime(DateTime.now().plus({minutes: 10}).toJSDate());

			const amountResponse = await requestTest
				.query({
					root: 'resource_get',
					fields: {fields: ['id', 'currentAmount']},
					variables: {id: {value: 'wood', type: 'ID'}},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(amountResponse.body.data.resource_get.currentAmount).toBe(150);
		});
	});
});
