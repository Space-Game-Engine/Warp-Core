import {HttpStatus, INestApplication} from '@nestjs/common';
import {DateTime} from 'luxon';
import supertest from 'supertest';

import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Building queue - basic update actions', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	const localBuildingZone = 3;

	const now = DateTime.now();

	function addBuildingToQueueRequest(endLevel: number): supertest.Test {
		return requestTest
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
							localBuildingZoneId: localBuildingZone,
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

	afterEach(() => {
		jest.useRealTimers();
	});

	describe('Create new building - lumber mill', () => {
		beforeEach(async () => {
			await addBuildingToQueueRequest(1);
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
				resourceId: 'stone_granite',
				value: 0,
			});
			expect(resourcesFromResponse).toHaveResourceWithValue({
				resourceId: 'coal',
				value: 5,
			});
		});

		it('Resources should not change after adding first level of lumber mill (wait 5s after adding first item)', async () => {
			jest.useFakeTimers().setSystemTime(now.plus({second: 5}).toJSDate());

			const response = await requestTest
				.query({
					root: 'resource_getAll',
					fields: {
						fields: ['id', 'currentAmount', 'productionRate'],
					},
				})
				.send()
				.expect(HttpStatus.OK);

			const resourcesFromResponse = response.body.data.resource_getAll;

			expect(resourcesFromResponse).toHaveResourceWithValue({
				resourceId: 'wood',
				value: 20,
			});
			expect(resourcesFromResponse).toHaveResourceWithCustomProperty({
				resourceId: 'wood',
				value: 0,
				property: 'productionRate',
			});
			expect(resourcesFromResponse).toHaveResourceWithValue({
				resourceId: 'stone_granite',
				value: 0,
			});
			expect(resourcesFromResponse).toHaveResourceWithValue({
				resourceId: 'coal',
				value: 5,
			});
		});

		describe('Wait 15s after adding first item', () => {
			beforeEach(async () => {
				jest.useFakeTimers().setSystemTime(now.plus({second: 15}).toJSDate());
			});

			it('Resources should change after consuming building queue', async () => {
				const response = await requestTest
					.query({
						root: 'resource_getAll',
						fields: {
							fields: ['id', 'currentAmount', 'productionRate'],
						},
					})
					.send()
					.expect(HttpStatus.OK);

				const resourcesFromResponse = response.body.data.resource_getAll;

				expect(resourcesFromResponse).toHaveResourceWithCustomProperty({
					resourceId: 'wood',
					value: 1,
					property: 'productionRate',
				});
				expect(resourcesFromResponse).toHaveResourceWithValue({
					resourceId: 'wood',
					minValue: 23,
					maxValue: 26,
				});
				expect(resourcesFromResponse).toHaveResourceWithValue({
					resourceId: 'stone_granite',
					value: 0,
				});
				expect(resourcesFromResponse).toHaveResourceWithValue({
					resourceId: 'coal',
					value: 5,
				});
			}, 9999999);
		});
	});
});
