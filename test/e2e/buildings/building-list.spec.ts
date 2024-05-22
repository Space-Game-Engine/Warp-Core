import {HttpStatus, INestApplication} from '@nestjs/common';

import {LoginParameters} from '@warp-core/auth/login/login-parameters.model';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/e2e-module';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';

describe('Get list of all buildings as unauthenticated', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	beforeAll(async () => {
		app = await createNestApplicationE2E();

		requestTest = requestGraphQL(app.getHttpServer());
	});

	it('should not return buildings list when user is not authenticated', async () => {
		const response = await requestTest
			.query({
				root: 'building_getAll',
				fields: {
					fields: ['name']
				}
				})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors[0].message).toBe('Unauthorized');
		expect(response.body.data.building_getAll).toBeNull();
	});
});

describe('Get list of all buildings as authenticated', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	beforeAll(async () => {
		app = await createNestApplicationE2E();

		requestTest = requestGraphQL(app.getHttpServer());
		await requestTest.authenticate({
			userId: 1,
			habitatId: 1,
		} as LoginParameters);
	});

	it('should return buildings list with length of 5 when user is authenticated', async () => {
		const response = await requestTest
			.query({
				root: 'building_getAll',
				fields: {
					fields: ['name']
				}
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.data.building_getAll).toHaveLength(5);
	});

	it('should return buildings with building details at certain level when user is authenticated', async () => {
		const response = await requestTest
			.query({
					root: 'building_getAll',
					fields: {
						fields: ['name'],
						buildingDetailsAtCertainLevel: {
							fields: ['level']
						}
					}
				})
			.send()
			.expect(HttpStatus.OK);

		const expectSingleBuildingContent = expect.objectContaining({
			name: expect.stringMatching(/\w+/),
			buildingDetailsAtCertainLevel: expect.any(Array),
		});

		expect(response.body.data.building_getAll).toHaveLength(5);
		expect(response.body.data.building_getAll).toEqual(
			expect.arrayContaining([
				expectSingleBuildingContent,
				expectSingleBuildingContent,
				expectSingleBuildingContent,
				expectSingleBuildingContent,
				expectSingleBuildingContent,
			]),
		);
	});
});
