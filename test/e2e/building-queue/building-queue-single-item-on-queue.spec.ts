import {HttpStatus, INestApplication} from '@nestjs/common';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Building queue with single item on queue', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;
	let config: RuntimeConfig;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		config = app.get(RuntimeConfig);
		config.habitat.buildingQueue.maxElementsInQueue = 1;

		return requestTest.registerAndAuthenticate(2);
	});

	describe('Multiple level update is not allowed', () => {
		beforeEach(() => {
			config.habitat.buildingQueue.allowMultipleLevelUpdate = false;
		});

		it('should allow user to update by single level', async () => {
			const response = await requestTest
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

			expect(response.body.data.buildingQueue_add.startLevel).toEqual(1);
			expect(response.body.data.buildingQueue_add.endLevel).toEqual(2);
			expect(response.body.data.buildingQueue_add.isConsumed).toEqual(false);
		});

		it('should throw error when user wants to update by multiple levels when update is possible', async () => {
			const response = await requestTest
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
								localBuildingZoneId: 2,
								endLevel: 4,
							},
						},
					},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(response.body.errors).toHaveLength(1);
			expect(response.body.errors[0].message).toBe('Queue Validation Error');
			expect(response.body.errors[0].validationError.endLevel).toHaveLength(1);
			expect(response.body.errors[0].validationError.endLevel).toContain(
				'You can only upgrade a building by one level at a time',
			);
		});

		it('should throw error when user wants to update by multiple levels and when update for that level is not possible', async () => {
			const response = await requestTest
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
								endLevel: 4,
							},
						},
					},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(response.body.errors).toHaveLength(1);
			expect(response.body.errors[0].message).toBe('Queue Validation Error');
			expect(response.body.errors[0].validationError.endLevel).toHaveLength(2);
			expect(response.body.errors[0].validationError.endLevel).toContain(
				'You can only upgrade a building by one level at a time',
			);
			expect(response.body.errors[0].validationError.endLevel).toContain(
				'You cannot update higher than it is possible. Check Building update details.',
			);
		});
	});
});
