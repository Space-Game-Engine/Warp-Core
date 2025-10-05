import {HttpStatus, INestApplication} from '@nestjs/common';
import {DateTime} from 'luxon';

import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Building queue - basic update building actions', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		await requestTest.registerAndAuthenticate(2);
	});

	describe('Update existing building in queue - warehouse', () => {
		beforeEach(async () => {
			await requestTest
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
				value: 10,
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

		it('should not change building level before any change', async () => {
			const response = await requestTest
				.query({
					root: 'buildingZone_get',
					fields: {
						fields: ['level'],
					},
					variables: {
						localBuildingZoneId: {
							value: 1,
							type: 'Int',
						},
					},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(response.body.data.buildingZone_get.level).toEqual(1);
		});

		it('there should be a single item in queue', async () => {
			const response = await requestTest
				.query({
					root: 'buildingQueue_getAll',
					fields: {
						fields: ['startLevel', 'endLevel', 'isConsumed'],
						building: {
							fields: ['id'],
						},
					},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(response.body.data.buildingQueue_getAll).toHaveLength(1);
			expect(response.body.data.buildingQueue_getAll[0].isConsumed).toEqual(
				false,
			);
			expect(response.body.data.buildingQueue_getAll[0].building.id).toEqual(
				'warehouse',
			);
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
						root: 'buildingQueue_getAll',
						fields: {
							fields: ['startLevel', 'endLevel', 'isConsumed'],
						},
					})
					.send()
					.expect(HttpStatus.OK);

				expect(response.body.data.buildingQueue_getAll).toHaveLength(0);
			});

			it('should change building level', async () => {
				const response = await requestTest
					.query({
						root: 'buildingZone_get',
						fields: {
							fields: ['level'],
						},
						variables: {
							localBuildingZoneId: {
								value: 1,
								type: 'Int',
							},
						},
					})
					.send()
					.expect(HttpStatus.OK);

				expect(response.body.data.buildingZone_get.level).toEqual(2);
			});
		});
	});
});
