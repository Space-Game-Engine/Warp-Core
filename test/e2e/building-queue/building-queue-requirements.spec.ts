import {HttpStatus, INestApplication} from '@nestjs/common';
import {DateTime} from 'luxon';
import supertest from 'supertest';

import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Building queue - level requirements', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	const localBuildingZone = 3;

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
							buildingId: 'train_factory',
							localBuildingZoneId: localBuildingZone,
							endLevel,
						},
					},
				},
			})
			.send();
	}

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

		return requestTest.registerAndAuthenticate(2);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should allow to add building to queue when levels have no research node requirements', async () => {
		const response = await addBuildingToQueueRequest(1).expect(HttpStatus.OK);

		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.buildingQueue_add.endLevel).toEqual(1);
	});

	it('should throw error when required research node is not developed', async () => {
		const response = await addBuildingToQueueRequest(2).expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.requirements).toEqual([
			'Research node basic_metallurgy at level 1 is required.',
		]);
	});

	it('should require highest research node level when upgrading by multiple levels', async () => {
		const response = await addBuildingToQueueRequest(3).expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].validationError.requirements).toEqual([
			'Research node basic_metallurgy at level 2 is required.',
		]);
	});

	it('should allow to add building to queue when required research node is developed', async () => {
		const researchResponse = await addResearchToQueueRequest(
			'basic_metallurgy',
			1,
		).expect(HttpStatus.OK);
		expect(researchResponse.body.errors).toBeUndefined();

		jest
			.useFakeTimers()
			.setSystemTime(DateTime.now().plus({minutes: 10}).toJSDate());

		const response = await addBuildingToQueueRequest(2).expect(HttpStatus.OK);

		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.buildingQueue_add.startLevel).toEqual(0);
		expect(response.body.data.buildingQueue_add.endLevel).toEqual(2);
	});
});
