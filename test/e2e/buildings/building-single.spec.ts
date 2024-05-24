import {HttpStatus, INestApplication} from '@nestjs/common';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/e2e-module';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {LoginParameters} from '@warp-core/auth/login/login-parameters.model';

describe('Get single building with details', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	beforeAll(async () => {
		app = await createNestApplicationE2E();

		requestTest = requestGraphQL(app.getHttpServer());
	});

	beforeEach(async () => {
		await requestTest.authenticate({
			userId: 1,
			habitatId: 1,
		} as LoginParameters);
	})

	it('should return single building when user is authenticated', async () => {
		const response = await requestTest
			.query(
				{
					root: 'building_get',
					fields: {
						fields: ['name']
					},
					variables: {
						id: {
							value: 'warehouse',
							type: 'ID'
						}
					}
				}
			)
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.data.building_get.name).toEqual('Warehouse');
	});

	it('should return single building with its details when user is authenticated', async () => {
		const response = await requestTest
			.query(
				{
					root: 'building_get',
					fields: {
						fields: ['name'],
						buildingDetailsAtCertainLevel: {
							fields: ['level']
						}
					},
					variables: {
						id: {
							value: 'warehouse',
							type: 'ID'
						}
					}
				}
			)
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.data.building_get.name).toEqual('Warehouse');
		expect(response.body.data.building_get.buildingDetailsAtCertainLevel.length).toEqual(2);
		expect(response.body.data.building_get.buildingDetailsAtCertainLevel[0].level).toEqual(1);
		expect(response.body.data.building_get.buildingDetailsAtCertainLevel[1].level).toEqual(2);
	});

})