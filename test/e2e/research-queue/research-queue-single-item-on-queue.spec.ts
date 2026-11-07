import {HttpStatus, INestApplication} from '@nestjs/common';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Research queue with single item on queue', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;
	let config: RuntimeConfig;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		config = app.get(RuntimeConfig);
		config.habitat.researchQueue.maxElementsInQueue = 1;

		return requestTest.registerAndAuthenticate(2);
	});

	it('should allow to add single item on queue', async () => {
		const response = await requestTest
			.mutation({
				root: 'researchQueue_add',
				operationName: 'AddResearchToQueue',
				fields: {
					fields: ['startLevel', 'endLevel', 'isConsumed'],
				},
				variables: {
					addToQueue: {
						type: 'AddResearchToQueueInput',
						value: {
							researchNodeId: 'basic_metallurgy',
							endLevel: 1,
						},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.researchQueue_add.startLevel).toEqual(0);
		expect(response.body.data.researchQueue_add.endLevel).toEqual(1);
		expect(response.body.data.researchQueue_add.isConsumed).toEqual(false);
	});

	it('should throw error on adding multiple item on queue', async () => {
		const firstQueueItemResponse = await requestTest
			.mutation({
				root: 'researchQueue_add',
				operationName: 'AddResearchToQueue',
				fields: {
					fields: ['startLevel', 'endLevel', 'isConsumed'],
				},
				variables: {
					addToQueue: {
						type: 'AddResearchToQueueInput',
						value: {
							researchNodeId: 'basic_metallurgy',
							endLevel: 1,
						},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(
			firstQueueItemResponse.body.data.researchQueue_add.startLevel,
		).toEqual(0);
		expect(firstQueueItemResponse.body.data.researchQueue_add.endLevel).toEqual(
			1,
		);
		expect(
			firstQueueItemResponse.body.data.researchQueue_add.isConsumed,
		).toEqual(false);

		const secondQueueItemResponse = await requestTest
			.mutation({
				root: 'researchQueue_add',
				operationName: 'AddResearchToQueue',
				fields: {
					fields: ['startLevel'],
				},
				variables: {
					addToQueue: {
						type: 'AddResearchToQueueInput',
						value: {
							researchNodeId: 'free_research',
							endLevel: 1,
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
