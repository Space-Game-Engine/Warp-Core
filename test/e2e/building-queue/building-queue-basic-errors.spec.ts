import {HttpStatus, INestApplication} from '@nestjs/common';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Building queue basic errors', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;
	let config: RuntimeConfig;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		config = app.get(RuntimeConfig);
		config.habitat.onStart.buildings[0].level = 2;
		config.habitat.buildingQueue.maxElementsInQueue = 1;
		config.habitat.buildingZones.counterForNewHabitat = 10;

		return requestTest.registerAndAuthenticate(2);
	});

	it('should throw error when provided building does not exists', async () => {
		const response = await requestTest
			.mutation({
				root: 'buildingQueue_add',
				operationName: 'AddToQueue',
				fields: {
					fields: ['startLevel', 'endLevel', 'isConsumed'],
				},
				variables: {
					addToQueue: {
						type: 'AddToQueueInput',
						value: {
							localBuildingZoneId: 10,
							endLevel: 1,
							buildingId: 'duck_school',
						},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.buildingId).toHaveLength(1);
		expect(response.body.errors[0].validationError.buildingId).toContain(
			'Provided building does not exist.',
		);
	});

	it('should throw error when building is too expensive to build', async () => {
		const response = await requestTest
			.mutation({
				root: 'buildingQueue_add',
				operationName: 'AddToQueue',
				fields: {
					fields: ['startLevel', 'endLevel', 'isConsumed'],
				},
				variables: {
					addToQueue: {
						type: 'AddToQueueInput',
						value: {
							localBuildingZoneId: 10,
							endLevel: 1,
							buildingId: 'expensive_building',
						},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe(
			'Insufficient Resources Exception',
		);
		expect(response.body.errors[0].validationError.resource).toHaveLength(1);
		expect(response.body.errors[0].validationError.resource[0].resourceId).toBe(
			'wood',
		);
	});

	it('should throw error when user wants to update by lower level than currently is built', async () => {
		const response = await requestTest
			.mutation({
				root: 'buildingQueue_add',
				operationName: 'AddToQueue',
				fields: {
					fields: ['startLevel', 'endLevel', 'isConsumed'],
				},
				variables: {
					addToQueue: {
						type: 'AddToQueueInput',
						value: {
							localBuildingZoneId: 1,
							endLevel: 1,
						},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.endLevel).toHaveLength(1);
		expect(response.body.errors[0].validationError.endLevel).toContain(
			'End level should not be lower than existing level.',
		);
	});

	it('should throw error when user wants to update by level that equals current level', async () => {
		const response = await requestTest
			.mutation({
				root: 'buildingQueue_add',
				operationName: 'AddToQueue',
				fields: {
					fields: ['startLevel', 'endLevel', 'isConsumed'],
				},
				variables: {
					addToQueue: {
						type: 'AddToQueueInput',
						value: {
							localBuildingZoneId: 1,
							endLevel: 2,
						},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.endLevel).toHaveLength(1);
		expect(response.body.errors[0].validationError.endLevel).toContain(
			'End level should not equal existing level.',
		);
	});

	it('should throw error when user wants to update by level that is higher than defined last possible update', async () => {
		const response = await requestTest
			.mutation({
				root: 'buildingQueue_add',
				operationName: 'AddToQueue',
				fields: {
					fields: ['startLevel', 'endLevel', 'isConsumed'],
				},
				variables: {
					addToQueue: {
						type: 'AddToQueueInput',
						value: {
							localBuildingZoneId: 1,
							endLevel: 100,
						},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.endLevel).toHaveLength(1);
		expect(response.body.errors[0].validationError.endLevel).toContain(
			'You cannot update higher than it is possible. Check Building update details.',
		);
	});

	it('should throw error when user wants to queue more items than defined in config', async () => {
		const responseWithProperQueueItem = await requestTest
			.mutation({
				root: 'buildingQueue_add',
				operationName: 'AddToQueue',
				fields: {
					fields: ['startLevel'],
				},
				variables: {
					addToQueue: {
						type: 'AddToQueueInput',
						value: {
							localBuildingZoneId: 2,
							endLevel: 2,
						},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);
		expect(responseWithProperQueueItem.body.errors).toBeUndefined();

		const failedQueueItemResponse = await requestTest
			.mutation({
				root: 'buildingQueue_add',
				operationName: 'AddToQueue',
				fields: {
					fields: ['startLevel'],
				},
				variables: {
					addToQueue: {
						type: 'AddToQueueInput',
						value: {
							localBuildingZoneId: 10,
							endLevel: 1,
							buildingId: 'lumber_mill',
						},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(failedQueueItemResponse.body.errors).toHaveLength(1);
		expect(failedQueueItemResponse.body.errors[0].message).toBe(
			'Queue Validation Error',
		);
		expect(
			failedQueueItemResponse.body.errors[0].validationError.queueInput,
		).toHaveLength(1);
		expect(
			failedQueueItemResponse.body.errors[0].validationError.queueInput,
		).toContain('Max queue count (1) has been reached');
	}, 999999);
});
