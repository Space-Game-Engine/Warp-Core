import {HttpStatus, INestApplication} from '@nestjs/common';
import supertest from 'supertest';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Research queue with multiple level update not allowed', () => {
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
		config.habitat.researchQueue.allowMultipleLevelUpdate = false;

		return requestTest.registerAndAuthenticate(2);
	});

	it('should allow to add single item on queue', async () => {
		const response = await addResearchToQueueRequest(
			'basic_metallurgy',
			1,
		).expect(HttpStatus.OK);

		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.researchQueue_add.startLevel).toEqual(0);
		expect(response.body.data.researchQueue_add.endLevel).toEqual(1);
		expect(response.body.data.researchQueue_add.isConsumed).toEqual(false);
	});

	it('should throw error when user wants to update by multiple levels when update is possible', async () => {
		const response = await addResearchToQueueRequest(
			'basic_metallurgy',
			2,
		).expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.endLevel).toHaveLength(1);
		expect(response.body.errors[0].validationError.endLevel).toContain(
			'You can only upgrade a research node by one level at a time',
		);
	});

	it('should throw error when user wants to update by multiple levels and when update for that level is not possible', async () => {
		const response = await addResearchToQueueRequest(
			'basic_metallurgy',
			100,
		).expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.endLevel).toHaveLength(2);
		expect(response.body.errors[0].validationError.endLevel).toContain(
			'You can only upgrade a research node by one level at a time',
		);
		expect(response.body.errors[0].validationError.endLevel).toContain(
			'You cannot update higher than it is possible. Check research node update details.',
		);
	});
});
