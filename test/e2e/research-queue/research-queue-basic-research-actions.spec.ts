import {HttpStatus, INestApplication} from '@nestjs/common';
import {DateTime} from 'luxon';

import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Research queue - basic research actions', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		await requestTest.registerAndAuthenticate(2);
	});

	describe('Develop new research node - basic metallurgy', () => {
		beforeEach(async () => {
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
		});

		it('should remove resources after putting element on queue', async () => {
			const response = await requestTest
				.query({
					root: 'resource_getAll',
					fields: {
						fields: ['id', 'currentAmount'],
					},
				})
				.send()
				.expect(HttpStatus.OK);

			const resourcesFromResponse = response.body.data.resource_getAll;

			expect(resourcesFromResponse).toHaveResourceWithValue({
				resourceId: 'wood',
				value: 20,
			});
			expect(resourcesFromResponse).toHaveResourceWithValue({
				resourceId: 'coal',
				value: 5,
			});
		});

		it('should not change research node level before queue is consumed', async () => {
			const response = await requestTest
				.query({
					root: 'technology_getAll',
					fields: {
						fields: ['currentLevel'],
						researchNode: {
							fields: ['id'],
						},
					},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(response.body.errors).toBeUndefined();

			const basicMetallurgy = response.body.data.technology_getAll.find(
				(technology: {researchNode: {id: string}}) =>
					technology.researchNode.id === 'basic_metallurgy',
			);

			expect(basicMetallurgy?.currentLevel ?? 0).toEqual(0);
		});

		it('there should be a single item in queue', async () => {
			const response = await requestTest
				.query({
					root: 'researchQueue_getAll',
					fields: {
						fields: ['startLevel', 'endLevel', 'isConsumed'],
						researchNode: {
							fields: ['id'],
						},
					},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(response.body.data.researchQueue_getAll).toHaveLength(1);
			expect(response.body.data.researchQueue_getAll[0].isConsumed).toEqual(
				false,
			);
			expect(
				response.body.data.researchQueue_getAll[0].researchNode.id,
			).toEqual('basic_metallurgy');
		});

		describe('Wait to consume queue', () => {
			beforeEach(async () => {
				jest
					.useFakeTimers()
					.setSystemTime(DateTime.now().plus({minutes: 10}).toJSDate());
			});

			afterEach(() => {
				jest.useRealTimers();
			});

			it('should clear the queue', async () => {
				const response = await requestTest
					.query({
						root: 'researchQueue_getAll',
						fields: {
							fields: ['startLevel', 'endLevel', 'isConsumed'],
						},
					})
					.send()
					.expect(HttpStatus.OK);

				expect(response.body.data.researchQueue_getAll).toHaveLength(0);
			});

			it('should change research node level', async () => {
				const response = await requestTest
					.query({
						root: 'technology_getAll',
						fields: {
							fields: ['currentLevel'],
							researchNode: {
								fields: ['id'],
							},
						},
					})
					.send()
					.expect(HttpStatus.OK);

				expect(response.body.errors).toBeUndefined();
				expect(response.body.data.technology_getAll).toEqual(
					expect.arrayContaining([
						{currentLevel: 1, researchNode: {id: 'basic_metallurgy'}},
					]),
				);
			});
		});
	});
});
