import {HttpStatus, INestApplication} from '@nestjs/common';
import supertest from 'supertest';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingRoleEnum} from '@warp-core/database/enum/building-role.enum';
import {BuildingBlueprintGlobalRepository} from '@warp-core/database/repository/building-blueprint-global.repository';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Unit queue basic errors', () => {
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
				fields: {fields: ['amount', 'isConsumed']},
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
		config.habitat.unitQueue.maxElementsInQueue = 1;
		config.habitat.onStart.buildings.push({
			id: 'barracks',
			localBuildingZoneId: 3,
			level: 1,
		});

		return requestTest.registerAndAuthenticate(2);
	});

	it('should throw error when provided unit does not exist', async () => {
		const response = await addUnitToQueueRequest('duck', 1).expect(
			HttpStatus.OK,
		);

		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.unitId).toContain(
			'Provided unit does not exist.',
		);
	});

	it('should throw error when no building or unit is able to build the unit', async () => {
		const response = await addUnitToQueueRequest('gun_turret', 1).expect(
			HttpStatus.OK,
		);

		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.unitId).toEqual([
			'Unit gun_turret cannot be built by any building or unit in that habitat.',
		]);
	});

	it('should throw error when amount is not positive', async () => {
		const response = await addUnitToQueueRequest('engineer', 0).expect(
			HttpStatus.OK,
		);

		expect(response.body.errors).toBeDefined();
		expect(response.body.data).toBeNull();
	});

	it('should throw error when habitat does not have enough resources for all units', async () => {
		const response = await addUnitToQueueRequest('engineer', 4).expect(
			HttpStatus.OK,
		);

		expect(response.body.errors[0].message).toBe(
			'Insufficient Resources Exception',
		);
	});

	it('should throw error when queue is full', async () => {
		const firstResponse = await addUnitToQueueRequest('engineer', 1).expect(
			HttpStatus.OK,
		);
		expect(firstResponse.body.errors).toBeUndefined();

		const response = await addUnitToQueueRequest('engineer', 1).expect(
			HttpStatus.OK,
		);

		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.queueInput).toEqual([
			'Max queue count (1) has been reached',
		]);
	});
});
