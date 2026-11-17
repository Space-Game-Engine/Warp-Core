import {HttpStatus, INestApplication} from '@nestjs/common';
import {DateTime} from 'luxon';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Building blueprint list', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	const blueprintFields = {
		fields: ['id', 'buildingId'],
		building: {fields: ['id', 'name']},
		buildingZones: {fields: ['localBuildingZoneId', 'level']},
		capabilities: {
			production: {fields: ['resourceId', 'amount', 'interval']},
			storage: {fields: ['storageType', 'amount']},
		},
	};

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		app.get(RuntimeConfig).habitat.onStart.buildings = [
			{id: 'warehouse', level: 1, localBuildingZoneId: 1},
			{id: 'lumber_mill', level: 1, localBuildingZoneId: 2},
			{id: 'lumber_mill', level: 2, localBuildingZoneId: 3},
		];

		return requestTest.registerAndAuthenticate(2);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should return unauthorized when user is not logged in', async () => {
		const response = await requestGraphQL(app.getHttpServer())
			.query({root: 'buildingBlueprint_getAll', fields: {fields: ['id']}})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors[0].message).toBe('Unauthorized');
	});

	it('should return one player blueprint per building placed on start with empty bonus capabilities', async () => {
		const response = await requestTest
			.query({root: 'buildingBlueprint_getAll', fields: blueprintFields})
			.send()
			.expect(HttpStatus.OK);

		const blueprints = response.body.data.buildingBlueprint_getAll;
		expect(blueprints).toHaveLength(2);

		const warehouse = blueprints.find(
			(blueprint: {buildingId: string}) => blueprint.buildingId === 'warehouse',
		);
		const lumberMill = blueprints.find(
			(blueprint: {buildingId: string}) =>
				blueprint.buildingId === 'lumber_mill',
		);

		expect(warehouse.building.name).toBe('Warehouse');
		expect(warehouse.buildingZones).toEqual([
			{localBuildingZoneId: 1, level: 1},
		]);
		expect(warehouse.capabilities).toEqual({production: [], storage: []});

		expect(lumberMill.buildingZones).toHaveLength(2);
		expect(lumberMill.buildingZones).toEqual(
			expect.arrayContaining([
				{localBuildingZoneId: 2, level: 1},
				{localBuildingZoneId: 3, level: 2},
			]),
		);
	});

	it('should create new player blueprint when building of new kind is built from queue', async () => {
		await requestTest
			.mutation({
				root: 'buildingQueue_add',
				operationName: 'AddToQueue',
				fields: {fields: ['id']},
				variables: {
					addToQueue: {
						type: 'AddToQueueInput',
						value: {
							buildingId: 'university',
							localBuildingZoneId: 4,
							endLevel: 1,
						},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		const beforeProcessing = await requestTest
			.query({
				root: 'buildingBlueprint_getAll',
				fields: {fields: ['buildingId']},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(beforeProcessing.body.data.buildingBlueprint_getAll).toHaveLength(2);

		jest
			.useFakeTimers()
			.setSystemTime(DateTime.now().plus({minutes: 5}).toJSDate());

		const afterProcessing = await requestTest
			.query({root: 'buildingBlueprint_getAll', fields: blueprintFields})
			.send()
			.expect(HttpStatus.OK);

		const blueprints = afterProcessing.body.data.buildingBlueprint_getAll;
		expect(blueprints).toHaveLength(3);

		const university = blueprints.find(
			(blueprint: {buildingId: string}) =>
				blueprint.buildingId === 'university',
		);
		expect(university.buildingZones).toEqual([
			{localBuildingZoneId: 4, level: 1},
		]);
	});
});
