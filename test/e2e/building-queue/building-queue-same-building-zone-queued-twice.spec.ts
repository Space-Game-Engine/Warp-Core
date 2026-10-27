import {HttpStatus, INestApplication} from '@nestjs/common';
import {DateTime} from 'luxon';
import supertest from 'supertest';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Building queue - same building zone queued twice', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	function addBuildingToQueueRequest(endLevel: number): supertest.Test {
		return requestTest
			.mutation({
				root: 'buildingQueue_add',
				operationName: 'AddToQueue',
				fields: {
					fields: ['startLevel', 'endLevel', 'startTime', 'endTime'],
				},
				variables: {
					addToQueue: {
						type: 'AddToQueueInput',
						value: {
							buildingId: 'lumber_mill',
							localBuildingZoneId: 3,
							endLevel,
						},
					},
				},
			})
			.send();
	}

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		const config = app.get(RuntimeConfig);
		config.habitat.buildingQueue.maxElementsInQueue = 10;
		config.habitat.buildingQueue.allowMultipleLevelUpdate = true;
		config.habitat.onStart.resources = [{id: 'wood', amount: 100}];

		await requestTest.registerAndAuthenticate(2);
	});

	describe('Queue level 1 and then level 2 of lumber mill', () => {
		let secondQueueElementResponse: supertest.Response;

		beforeEach(async () => {
			const firstQueueElementResponse = await addBuildingToQueueRequest(
				1,
			).expect(HttpStatus.OK);
			expect(firstQueueElementResponse.body.errors).toBeUndefined();

			secondQueueElementResponse = await addBuildingToQueueRequest(2).expect(
				HttpStatus.OK,
			);
			expect(secondQueueElementResponse.body.errors).toBeUndefined();
		});

		it('should start second queue element from end level of first queue element', async () => {
			expect(
				secondQueueElementResponse.body.data.buildingQueue_add.startLevel,
			).toEqual(1);
			expect(
				secondQueueElementResponse.body.data.buildingQueue_add.endLevel,
			).toEqual(2);
		});

		it('should calculate time of second queue element only for not queued levels', async () => {
			const {startTime, endTime} =
				secondQueueElementResponse.body.data.buildingQueue_add;

			expect(
				DateTime.fromISO(endTime).diff(DateTime.fromISO(startTime), 'seconds')
					.seconds,
			).toEqual(30);
		});

		it('should charge resources only once for each level', async () => {
			const response = await requestTest
				.query({
					root: 'resource_getAll',
					fields: {
						fields: ['id', 'currentAmount'],
					},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(response.body.data.resource_getAll).toHaveResourceWithValue({
				resourceId: 'wood',
				value: 40,
			});
		});
	});
});
