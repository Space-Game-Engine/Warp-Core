import {HttpStatus, INestApplication} from '@nestjs/common';
import {DateTime} from 'luxon';
import supertest from 'supertest';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Research queue - research node prerequisites', () => {
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
		config.habitat.researchQueue.maxElementsInQueue = 10;
		config.habitat.researchQueue.allowMultipleLevelUpdate = true;

		return requestTest.registerAndAuthenticate(2);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should throw error when required research node is not developed', async () => {
		const response = await addResearchToQueueRequest(
			'advanced_metallurgy',
			1,
		).expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.requirements).toHaveLength(
			1,
		);
		expect(response.body.errors[0].validationError.requirements).toContain(
			'Research node basic_metallurgy at level 1 is required.',
		);
	});

	it('should throw error when required research node is only queued and not developed yet', async () => {
		const prerequisiteResponse = await addResearchToQueueRequest(
			'basic_metallurgy',
			1,
		).expect(HttpStatus.OK);
		expect(prerequisiteResponse.body.errors).toBeUndefined();

		const response = await addResearchToQueueRequest(
			'advanced_metallurgy',
			1,
		).expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.requirements).toContain(
			'Research node basic_metallurgy at level 1 is required.',
		);
	});

	it('should allow to add research node to queue when required research node is developed', async () => {
		const prerequisiteResponse = await addResearchToQueueRequest(
			'basic_metallurgy',
			1,
		).expect(HttpStatus.OK);
		expect(prerequisiteResponse.body.errors).toBeUndefined();

		jest
			.useFakeTimers()
			.setSystemTime(DateTime.now().plus({minutes: 10}).toJSDate());

		const response = await addResearchToQueueRequest(
			'advanced_metallurgy',
			1,
		).expect(HttpStatus.OK);

		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.researchQueue_add.startLevel).toEqual(0);
		expect(response.body.data.researchQueue_add.endLevel).toEqual(1);
		expect(response.body.data.researchQueue_add.isConsumed).toEqual(false);
	});

	it('should return error for every missing required research node', async () => {
		const response = await addResearchToQueueRequest(
			'steel_engineering',
			1,
		).expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.requirements).toHaveLength(
			2,
		);
		expect(response.body.errors[0].validationError.requirements).toContain(
			'Research node basic_metallurgy at level 2 is required.',
		);
		expect(response.body.errors[0].validationError.requirements).toContain(
			'Research node advanced_metallurgy at level 1 is required.',
		);
	});

	it('should return error only for missing required research node when some prerequisites are developed', async () => {
		const prerequisiteResponse = await addResearchToQueueRequest(
			'basic_metallurgy',
			2,
		).expect(HttpStatus.OK);
		expect(prerequisiteResponse.body.errors).toBeUndefined();

		jest
			.useFakeTimers()
			.setSystemTime(DateTime.now().plus({minutes: 10}).toJSDate());

		const response = await addResearchToQueueRequest(
			'steel_engineering',
			1,
		).expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].message).toBe('Queue Validation Error');
		expect(response.body.errors[0].validationError.requirements).toHaveLength(
			1,
		);
		expect(response.body.errors[0].validationError.requirements).toContain(
			'Research node advanced_metallurgy at level 1 is required.',
		);
	});

	it('should throw error when required research node is developed to lower level than required', async () => {
		const prerequisiteResponse = await addResearchToQueueRequest(
			'basic_metallurgy',
			1,
		).expect(HttpStatus.OK);
		expect(prerequisiteResponse.body.errors).toBeUndefined();

		jest
			.useFakeTimers()
			.setSystemTime(DateTime.now().plus({minutes: 10}).toJSDate());

		const response = await addResearchToQueueRequest(
			'steel_engineering',
			1,
		).expect(HttpStatus.OK);

		expect(response.body.errors).toHaveLength(1);
		expect(response.body.errors[0].validationError.requirements).toContain(
			'Research node basic_metallurgy at level 2 is required.',
		);
	});
});
