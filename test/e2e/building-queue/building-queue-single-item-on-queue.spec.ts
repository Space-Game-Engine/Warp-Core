import {HttpStatus, INestApplication} from '@nestjs/common';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Building queue with single item on queue', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;
	let config: RuntimeConfig;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		config = app.get(RuntimeConfig);
		config.habitat.buildingQueue.maxElementsInQueue = 1;

		return requestTest.registerAndAuthenticate(2);
	});

	it('should allow to add single item on queue', async () => {
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

		expect(response.body.data.buildingQueue_add.startLevel).toEqual(1);
		expect(response.body.data.buildingQueue_add.endLevel).toEqual(2);
		expect(response.body.data.buildingQueue_add.isConsumed).toEqual(false);
	});

	it('should throw error on adding multiple item on queue', async () => {
		const firstQueueItemResponse = await requestTest
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

		expect(
			firstQueueItemResponse.body.data.buildingQueue_add.startLevel,
		).toEqual(1);
		expect(firstQueueItemResponse.body.data.buildingQueue_add.endLevel).toEqual(
			2,
		);
		expect(
			firstQueueItemResponse.body.data.buildingQueue_add.isConsumed,
		).toEqual(false);

		const secondQueueItemResponse = await requestTest
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

		expect(secondQueueItemResponse.body.errors).toHaveLength(1);
		expect(secondQueueItemResponse.body.errors[0].message).toBe(
			'Queue Validation Error',
		);
		expect(
			secondQueueItemResponse.body.errors[0].validationError.queueInput,
		).toHaveLength(1);
		expect(
			secondQueueItemResponse.body.errors[0].validationError.queueInput,
		).toContain('Max queue count (1) has been reached');
	});
});
