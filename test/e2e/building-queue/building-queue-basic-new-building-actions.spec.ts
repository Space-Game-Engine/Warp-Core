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

	const addBuildingToQueueRequest: () => supertest.Test = () =>
		requestTest
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
							endLevel: 1,
						},
					},
				},
			})
			.send();

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		await requestTest.registerAndAuthenticate(2);
	});

	it('should add new item to building queue', async () => {
		const response = await addBuildingToQueueRequest().expect(HttpStatus.OK);

		const buildingQueueAdd = response.body.data.buildingQueue_add;
		expect(buildingQueueAdd.startLevel).toBe(0);
		expect(buildingQueueAdd.endLevel).toBe(1);
		expect(buildingQueueAdd.isConsumed).toBe(false);
	});

	describe('Create new building - lumber mill', () => {
		beforeEach(async () => {
			await addBuildingToQueueRequest();
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

		it('should not change building level before any change', async () => {
			const response = await requestTest
				.query({
					root: 'buildingZone_get',
					fields: {
						fields: ['level'],
					},
					variables: {
						localBuildingZoneId: {
							value: localBuildingZone,
							type: 'Int',
						},
					},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(response.body.data.buildingZone_get.level).toEqual(0);
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
				'lumber_mill',
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
								value: localBuildingZone,
								type: 'Int',
							},
						},
					})
					.send()
					.expect(HttpStatus.OK);

				expect(response.body.data.buildingZone_get.level).toEqual(1);
			});
		});
	});
});
