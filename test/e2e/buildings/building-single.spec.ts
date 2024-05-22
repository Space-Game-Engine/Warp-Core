import {HttpStatus, INestApplication} from '@nestjs/common';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/e2e-module';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {LoginParameters} from '@warp-core/auth/login/login-parameters.model';

describe.only('Get single building with details', () => {
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
	})

})