import {HttpStatus, INestApplication} from '@nestjs/common';
import {DateTime} from 'luxon';
import supertest from 'supertest';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Research queue basic errors', () => {
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
		config.habitat.researchQueue.maxElementsInQueue = 1;
		config.habitat.researchQueue.allowMultipleLevelUpdate = true;

		return requestTest.registerAndAuthenticate(2);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should throw error when provided research node does not exists', async () => {
		const response = await addResearchToQueueRequest('duck_research', 1).expect(
			HttpStatus.OK,
		);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.researchNodeId).toHaveLength(
			1,
		);
		expect(response.body.errors[0].validationError.researchNodeId).toContain(
			'Provided research node does not exist.',
		);
	});

	it('should throw error when research node is too expensive to develop', async () => {
		const response = await addResearchToQueueRequest(
			'expensive_research',
			1,
		).expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe(
			'Insufficient Resources Exception',
		);
		expect(response.body.errors[0].validationError.resource).toHaveLength(1);
		expect(response.body.errors[0].validationError.resource[0].resourceId).toBe(
			'wood',
		);
	});

	describe('Research node already developed to level 2', () => {
		beforeEach(async () => {
			const response = await addResearchToQueueRequest(
				'free_research',
				2,
			).expect(HttpStatus.OK);
			expect(response.body.errors).toBeUndefined();

			jest
				.useFakeTimers()
				.setSystemTime(DateTime.now().plus({minutes: 10}).toJSDate());
		});

		it('should throw error when user wants to update by lower level than currently is developed', async () => {
			const response = await addResearchToQueueRequest(
				'free_research',
				1,
			).expect(HttpStatus.OK);

			expect(response.body.errors).toHaveLength(1);
			expect(response.body.errors[0].message).toBe('Queue Validation Error');
			expect(response.body.errors[0].validationError.endLevel).toHaveLength(1);
			expect(response.body.errors[0].validationError.endLevel).toContain(
				'End level should not be lower than existing level.',
			);
		});

		it('should throw error when user wants to update by level that equals current level', async () => {
			const response = await addResearchToQueueRequest(
				'free_research',
				2,
			).expect(HttpStatus.OK);

			expect(response.body.errors).toHaveLength(1);
			expect(response.body.errors[0].message).toBe('Queue Validation Error');
			expect(response.body.errors[0].validationError.endLevel).toHaveLength(1);
			expect(response.body.errors[0].validationError.endLevel).toContain(
				'End level should not equal existing level.',
			);
		});
	});

	it('should throw error when user wants to update by level that is higher than defined last possible update', async () => {
		const response = await addResearchToQueueRequest(
			'basic_metallurgy',
			100,
		).expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.endLevel).toHaveLength(1);
		expect(response.body.errors[0].validationError.endLevel).toContain(
			'You cannot update higher than it is possible. Check research node update details.',
		);
	});

	it('should throw error when user wants to queue more items than defined in config', async () => {
		const responseWithProperQueueItem = await addResearchToQueueRequest(
			'free_research',
			1,
		).expect(HttpStatus.OK);
		expect(responseWithProperQueueItem.body.errors).toBeUndefined();

		const failedQueueItemResponse = await addResearchToQueueRequest(
			'basic_metallurgy',
			1,
		).expect(HttpStatus.OK);

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
	});
});
