import {HttpStatus, INestApplication} from '@nestjs/common';
import {DateTime} from 'luxon';
import supertest from 'supertest';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingRoleEnum} from '@warp-core/database/enum/building-role.enum';
import {BuildingBlueprintGlobalRepository} from '@warp-core/database/repository/building-blueprint-global.repository';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Unit queue basic unit actions', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;
	let config: RuntimeConfig;

	function addUnitToQueueRequest(
		unitId: string,
		amount: number,
	): supertest.Test {
		return requestTest
			.mutation({
				root: 'unitQueue_add',
				operationName: 'AddUnitToQueue',
				fields: {
					fields: ['amount', 'isConsumed', 'startTime', 'endTime'],
					costs: {fields: ['cost'], resource: {fields: ['id']}},
				},
				variables: {
					addToQueue: {
						type: 'AddUnitToQueueInput',
						value: {unitId, amount},
					},
				},
			})
			.send();
	}

	function getUnitDraftRequest(unitId: string, amount: number): supertest.Test {
		return requestTest
			.mutation({
				root: 'unitQueue_getDraft',
				operationName: 'GetUnitDraft',
				fields: {
					fields: ['amount', 'isConsumed'],
					costs: {fields: ['cost'], resource: {fields: ['id']}},
				},
				variables: {
					addToQueue: {
						type: 'AddUnitToQueueInput',
						value: {unitId, amount},
					},
				},
			})
			.send();
	}

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		// repository.create() is required to persist lazy relations
		const buildingRepository = app.get(BuildingBlueprintGlobalRepository);
		await buildingRepository.save(
			buildingRepository.create({
				id: 'barracks',
				role: BuildingRoleEnum.UNIT_PRODUCTION,
				name: 'Barracks',
				buildingDetailsAtCertainLevel: [
					{
						details: {level: 1, timeToUpdateInSeconds: 10},
						capabilities: {
							construction: {
								buildableUnits: [{unitBlueprintId: 'engineer'}],
							},
						},
					},
				],
			} as never),
		);

		config = app.get(RuntimeConfig);
		config.habitat.unitQueue.maxElementsInQueue = 2;
		config.habitat.onStart.buildings.push({
			id: 'barracks',
			localBuildingZoneId: 3,
			level: 1,
		});

		return requestTest.registerAndAuthenticate(2);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should add units to queue and consume resources for every unit', async () => {
		const response = await addUnitToQueueRequest('engineer', 2).expect(
			HttpStatus.OK,
		);

		expect(response.body.errors).toBeUndefined();

		const queueElement = response.body.data.unitQueue_add;
		expect(queueElement.amount).toEqual(2);
		expect(queueElement.isConsumed).toEqual(false);
		expect(queueElement.costs).toEqual([{cost: 20, resource: {id: 'wood'}}]);
		// 30 seconds per engineer
		expect(
			DateTime.fromISO(queueElement.endTime).diff(
				DateTime.fromISO(queueElement.startTime),
				'seconds',
			).seconds,
		).toEqual(60);

		const resourcesResponse = await requestTest
			.query({
				root: 'resource_getAll',
				fields: {fields: ['id', 'currentAmount']},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(resourcesResponse.body.data.resource_getAll).toHaveResourceWithValue(
			{resourceId: 'wood', value: 10},
		);
	});

	it('should return draft without consuming resources', async () => {
		const response = await getUnitDraftRequest('engineer', 3).expect(
			HttpStatus.OK,
		);

		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.unitQueue_getDraft.amount).toEqual(3);
		expect(response.body.data.unitQueue_getDraft.costs).toEqual([
			{cost: 30, resource: {id: 'wood'}},
		]);

		const queueResponse = await requestTest
			.query({root: 'unitQueue_getAll', fields: {fields: ['amount']}})
			.send()
			.expect(HttpStatus.OK);

		expect(queueResponse.body.data.unitQueue_getAll).toHaveLength(0);
	});

	it('should create separate unit instances with effective capabilities when queue element is finished', async () => {
		await addUnitToQueueRequest('engineer', 2).expect(HttpStatus.OK);

		jest
			.useFakeTimers()
			.setSystemTime(DateTime.now().plus({minutes: 10}).toJSDate());

		const queueResponse = await requestTest
			.query({root: 'unitQueue_getAll', fields: {fields: ['amount']}})
			.send()
			.expect(HttpStatus.OK);
		expect(queueResponse.body.data.unitQueue_getAll).toHaveLength(0);

		const unitsResponse = await requestTest
			.query({
				root: 'unitInstance_getAll',
				fields: {
					fields: ['id'],
					unit: {fields: ['id']},
					capabilities: {production: {fields: ['resourceId']}},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(unitsResponse.body.errors).toBeUndefined();
		expect(unitsResponse.body.data.unitInstance_getAll).toHaveLength(2);
		for (const unit of unitsResponse.body.data.unitInstance_getAll) {
			expect(unit.unit.id).toEqual('engineer');
			expect(unit.capabilities.production).toEqual([]);
		}
	});

	it('should allow to build unit that can be built by already built unit', async () => {
		const gunTurretBefore = await getUnitDraftRequest('gun_turret', 1).expect(
			HttpStatus.OK,
		);
		expect(gunTurretBefore.body.errors[0].validationError.unitId).toHaveLength(
			1,
		);

		await addUnitToQueueRequest('engineer', 1).expect(HttpStatus.OK);
		jest
			.useFakeTimers()
			.setSystemTime(DateTime.now().plus({minutes: 10}).toJSDate());

		const gunTurretAfter = await getUnitDraftRequest('gun_turret', 1).expect(
			HttpStatus.OK,
		);
		expect(gunTurretAfter.body.errors).toBeUndefined();
		expect(gunTurretAfter.body.data.unitQueue_getDraft.costs).toEqual([
			{cost: 15, resource: {id: 'stone_granite'}},
		]);
	});
});
