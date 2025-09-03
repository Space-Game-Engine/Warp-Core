import {HttpStatus, INestApplication} from '@nestjs/common';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Building queue with multiple items on queue', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;
	let config: RuntimeConfig;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		config = app.get(RuntimeConfig);
		config.habitat.buildingQueue.maxElementsInQueue = 10;

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

	it('should allow adding multiple item on queue', async () => {
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
					fields: ['startLevel', 'endLevel', 'isConsumed'],
				},
				variables: {
					addToQueue: {
						type: 'AddToQueueInput',
						value: {
							buildingId: 'lumber_mill',
							localBuildingZoneId: 3,
							endLevel: 1,
						},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(
			secondQueueItemResponse.body.data.buildingQueue_add.startLevel,
		).toEqual(0);
		expect(
			secondQueueItemResponse.body.data.buildingQueue_add.endLevel,
		).toEqual(1);
		expect(
			secondQueueItemResponse.body.data.buildingQueue_add.isConsumed,
		).toEqual(false);
	});
});
