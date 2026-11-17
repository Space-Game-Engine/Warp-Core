import {HttpStatus, INestApplication} from '@nestjs/common';

import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Building blueprint single', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		return requestTest.registerAndAuthenticate(2);
	});

	it('should return unauthorized when user is not logged in', async () => {
		const response = await requestGraphQL(app.getHttpServer())
			.query({
				root: 'buildingBlueprint_get',
				fields: {fields: ['id']},
				variables: {buildingId: {value: 'warehouse', type: 'ID'}},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors[0].message).toBe('Unauthorized');
	});

	it('should return player blueprint for building placed on start', async () => {
		const response = await requestTest
			.query({
				root: 'buildingBlueprint_get',
				fields: {
					fields: ['id', 'buildingId'],
					building: {fields: ['id', 'role']},
					habitat: {fields: ['id']},
					capabilities: {fields: ['id']},
				},
				variables: {buildingId: {value: 'warehouse', type: 'ID'}},
			})
			.send()
			.expect(HttpStatus.OK);

		const blueprint = response.body.data.buildingBlueprint_get;
		expect(blueprint.buildingId).toBe('warehouse');
		expect(blueprint.building.id).toBe('warehouse');
		expect(blueprint.building.role).toBe('WAREHOUSE_ONLY');
		expect(blueprint.habitat.id).toMatch(/\d+/);
		expect(blueprint.capabilities.id).toMatch(/\d+/);
	});

	it('should return null when habitat did not build that building yet', async () => {
		const response = await requestTest
			.query({
				root: 'buildingBlueprint_get',
				fields: {fields: ['id']},
				variables: {buildingId: {value: 'coal_mine', type: 'ID'}},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.data.buildingBlueprint_get).toBeNull();
	});

	it('should return null when building does not exist', async () => {
		const response = await requestTest
			.query({
				root: 'buildingBlueprint_get',
				fields: {fields: ['id']},
				variables: {buildingId: {value: 'duck_school', type: 'ID'}},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.data.buildingBlueprint_get).toBeNull();
	});
});
