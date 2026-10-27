import {HttpStatus, INestApplication} from '@nestjs/common';
import {DateTime} from 'luxon';
import supertest from 'supertest';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Research queue - same research node queued twice', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	function addResearchToQueueRequest(endLevel: number): supertest.Test {
		return requestTest
			.mutation({
				root: 'researchQueue_add',
				operationName: 'AddResearchToQueue',
				fields: {
					fields: ['startLevel', 'endLevel', 'startTime', 'endTime'],
				},
				variables: {
					addToQueue: {
						type: 'AddResearchToQueueInput',
						value: {
							researchNodeId: 'basic_metallurgy',
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
		config.habitat.researchQueue.maxElementsInQueue = 10;
		config.habitat.researchQueue.allowMultipleLevelUpdate = true;

		await requestTest.registerAndAuthenticate(2);
	});

	describe('Queue level 1 and then level 2 of basic metallurgy', () => {
		let secondQueueElementResponse: supertest.Response;

		beforeEach(async () => {
			const firstQueueElementResponse = await addResearchToQueueRequest(
				1,
			).expect(HttpStatus.OK);
			expect(firstQueueElementResponse.body.errors).toBeUndefined();

			secondQueueElementResponse = await addResearchToQueueRequest(2).expect(
				HttpStatus.OK,
			);
			expect(secondQueueElementResponse.body.errors).toBeUndefined();
		});

		it('should start second queue element from end level of first queue element', async () => {
			expect(
				secondQueueElementResponse.body.data.researchQueue_add.startLevel,
			).toEqual(1);
			expect(
				secondQueueElementResponse.body.data.researchQueue_add.endLevel,
			).toEqual(2);
		});

		it('should calculate time of second queue element only for not queued levels', async () => {
			const {startTime, endTime} =
				secondQueueElementResponse.body.data.researchQueue_add;

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
				value: 10,
			});
		});
	});
});
