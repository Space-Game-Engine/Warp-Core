import {HttpStatus, INestApplication} from '@nestjs/common';
import {DateTime} from 'luxon';
import supertest from 'supertest';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Research queue - building requirements', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;
	let config: RuntimeConfig;

	const universityLocalBuildingZone = 2;

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

	function upgradeUniversityRequest(endLevel: number): supertest.Test {
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
							buildingId: 'university',
							localBuildingZoneId: universityLocalBuildingZone,
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

		return requestTest.registerAndAuthenticate(2);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should throw error when required building is built to lower level than required', async () => {
		const response = await addResearchToQueueRequest(
			'academic_studies',
			1,
		).expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.requirements).toEqual([
			'Building university at level 2 is required.',
		]);
	});

	it('should throw error when required building upgrade is only queued and not finished yet', async () => {
		const upgradeResponse = await upgradeUniversityRequest(2).expect(
			HttpStatus.OK,
		);
		expect(upgradeResponse.body.errors).toBeUndefined();

		const response = await addResearchToQueueRequest(
			'academic_studies',
			1,
		).expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].validationError.requirements).toEqual([
			'Building university at level 2 is required.',
		]);
	});

	it('should allow to add research node to queue when required building is built', async () => {
		const upgradeResponse = await upgradeUniversityRequest(2).expect(
			HttpStatus.OK,
		);
		expect(upgradeResponse.body.errors).toBeUndefined();

		jest
			.useFakeTimers()
			.setSystemTime(DateTime.now().plus({minutes: 10}).toJSDate());

		const response = await addResearchToQueueRequest(
			'academic_studies',
			1,
		).expect(HttpStatus.OK);

		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.researchQueue_add.startLevel).toEqual(0);
		expect(response.body.data.researchQueue_add.endLevel).toEqual(1);
	});
});
