import {HttpStatus, INestApplication} from '@nestjs/common';
import supertest from 'supertest';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Research queue with multiple items on queue', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;
	let config: RuntimeConfig;

	function addResearchToQueueRequest(
		researchNodeId: string,
		endLevel: number,
	): supertest.Test {
		return requestTest
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
							researchNodeId,
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

		config = app.get(RuntimeConfig);
		config.habitat.researchQueue.maxElementsInQueue = 10;
		config.habitat.researchQueue.allowMultipleLevelUpdate = true;

		return requestTest.registerAndAuthenticate(2);
	});

	it('should allow to add single item on queue', async () => {
		const response = await addResearchToQueueRequest(
			'basic_metallurgy',
			1,
		).expect(HttpStatus.OK);

		expect(response.body.data.researchQueue_add.startLevel).toEqual(0);
		expect(response.body.data.researchQueue_add.endLevel).toEqual(1);
		expect(response.body.data.researchQueue_add.isConsumed).toEqual(false);
	});

	it('should allow adding multiple different research nodes on queue', async () => {
		const firstQueueItemResponse = await addResearchToQueueRequest(
			'basic_metallurgy',
			1,
		).expect(HttpStatus.OK);

		expect(firstQueueItemResponse.body.errors).toBeUndefined();
		expect(
			firstQueueItemResponse.body.data.researchQueue_add.startLevel,
		).toEqual(0);
		expect(firstQueueItemResponse.body.data.researchQueue_add.endLevel).toEqual(
			1,
		);

		const secondQueueItemResponse = await addResearchToQueueRequest(
			'free_research',
			1,
		).expect(HttpStatus.OK);

		expect(secondQueueItemResponse.body.errors).toBeUndefined();
		expect(
			secondQueueItemResponse.body.data.researchQueue_add.startLevel,
		).toEqual(0);
		expect(
			secondQueueItemResponse.body.data.researchQueue_add.endLevel,
		).toEqual(1);
		expect(
			secondQueueItemResponse.body.data.researchQueue_add.isConsumed,
		).toEqual(false);

		const queueResponse = await requestTest
			.query({
				root: 'researchQueue_getAll',
				fields: {
					fields: ['startLevel', 'endLevel'],
					researchNode: {
						fields: ['id'],
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(queueResponse.body.data.researchQueue_getAll).toHaveLength(2);
	});

	it('should allow adding the same research node multiple times with increasing levels', async () => {
		const firstQueueItemResponse = await addResearchToQueueRequest(
			'basic_metallurgy',
			1,
		).expect(HttpStatus.OK);

		expect(firstQueueItemResponse.body.errors).toBeUndefined();

		const secondQueueItemResponse = await addResearchToQueueRequest(
			'basic_metallurgy',
			2,
		).expect(HttpStatus.OK);

		expect(secondQueueItemResponse.body.errors).toBeUndefined();
		expect(
			secondQueueItemResponse.body.data.researchQueue_add.startLevel,
		).toEqual(1);
		expect(
			secondQueueItemResponse.body.data.researchQueue_add.endLevel,
		).toEqual(2);
	});

	it('should throw error when new queue element has end level not higher than last queue element', async () => {
		const firstQueueItemResponse = await addResearchToQueueRequest(
			'free_research',
			2,
		).expect(HttpStatus.OK);

		expect(firstQueueItemResponse.body.errors).toBeUndefined();

		const secondQueueItemResponse = await addResearchToQueueRequest(
			'free_research',
			1,
		).expect(HttpStatus.OK);

		expect(secondQueueItemResponse.body.errors).toHaveLength(1);
		expect(secondQueueItemResponse.body.errors[0].message).toBe(
			'Queue Validation Error',
		);
		expect(
			secondQueueItemResponse.body.errors[0].validationError.endLevel,
		).toContain(
			'New queue element should have end level higher than last queue element',
		);
	});
});
