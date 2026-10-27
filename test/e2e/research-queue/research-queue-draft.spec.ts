import {HttpStatus, INestApplication} from '@nestjs/common';
import supertest from 'supertest';

import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Research queue - draft', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	function getResearchDraftRequest(
		researchNodeId: string,
		endLevel: number,
	): supertest.Test {
		return requestTest
			.mutation({
				root: 'researchQueue_getDraft',
				operationName: 'GetResearchDraft',
				fields: {
					fields: ['startLevel', 'endLevel', 'isConsumed'],
					costs: {
						fields: ['cost'],
						resource: {
							fields: ['id'],
						},
					},
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

		await requestTest.registerAndAuthenticate(2);
	});

	it('should return draft of queue element with costs', async () => {
		const response = await getResearchDraftRequest(
			'basic_metallurgy',
			1,
		).expect(HttpStatus.OK);

		expect(response.body.errors).toBeUndefined();

		const draft = response.body.data.researchQueue_getDraft;

		expect(draft.startLevel).toEqual(0);
		expect(draft.endLevel).toEqual(1);
		expect(draft.isConsumed).toEqual(false);
		expect(draft.costs).toHaveLength(1);
		expect(draft.costs[0].resource.id).toEqual('wood');
		expect(draft.costs[0].cost).toEqual(10);
	});

	it('should not consume resources nor add element to queue when draft is prepared', async () => {
		await getResearchDraftRequest('basic_metallurgy', 1).expect(HttpStatus.OK);

		const resourcesResponse = await requestTest
			.query({
				root: 'resource_getAll',
				fields: {
					fields: ['id', 'currentAmount'],
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(resourcesResponse.body.data.resource_getAll).toHaveResourceWithValue(
			{
				resourceId: 'wood',
				value: 30,
			},
		);

		const queueResponse = await requestTest
			.query({
				root: 'researchQueue_getAll',
				fields: {
					fields: ['startLevel'],
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(queueResponse.body.data.researchQueue_getAll).toHaveLength(0);
	});

	it('should throw error when provided research node does not exists', async () => {
		const response = await getResearchDraftRequest('duck_research', 1).expect(
			HttpStatus.OK,
		);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.researchNodeId).toContain(
			'Provided research node does not exist.',
		);
	});
});
