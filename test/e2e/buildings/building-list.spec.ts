import {TestingModule} from '@nestjs/testing';
import {HttpStatus, INestApplication} from '@nestjs/common';
import {e2eModule} from '@warp-core/test/e2e/utils/e2e-module';
import requestGraphql from '@warp-core/test/e2e/utils/graphql-request-test';
import {LoginParameters} from '@warp-core/auth/login/login-parameters.model';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';

describe('Get list of all buildings as unauthenticated', () => {
	let module: TestingModule;
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	beforeAll(async () => {
		module = await e2eModule();
		app = module.createNestApplication();
		await app.init();

		requestTest = requestGraphql(app.getHttpServer());
	});

	it('should not return buildings list when user is not authenticated', async () => {
		const response = await requestTest
			.query(`
				{
					building_getAll {
						name
					}
				}
			`)
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors[0].message).toEqual('Unauthorized');
		expect(response.body.data.building_getAll).toBeNull();
	});
});

describe('Get list of all buildings as authenticated', () => {
	let module: TestingModule;
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	beforeAll(async () => {
		module = await e2eModule();
		app = module.createNestApplication();
		await app.init();

		requestTest = requestGraphql(app.getHttpServer());
		await requestTest.authenticate({
			userId: 1,
			habitatId: 1,
		} as LoginParameters);
	});

	it('should not return buildings list when user is not authenticated', async () => {
		const config = app.get(RuntimeConfig);
		const response = await requestTest
			.query(`
				{
					building_getAll{
						name
					}
				}
			`)
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.data.building_getAll).toHaveLength(5);
	});
});
