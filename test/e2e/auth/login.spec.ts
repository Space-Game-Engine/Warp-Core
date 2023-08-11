import {e2eModule} from '@warp-core/test/e2e/utils/e2e-module';
import {TestingModule} from '@nestjs/testing';
import {HttpStatus, INestApplication} from '@nestjs/common';
import * as request from 'supertest';
import {LoginParameters} from '@warp-core/auth/login/login-parameters.model';

describe("Login", () => {
	let module: TestingModule;
	let app: INestApplication;
	// let databaseConnection;
	beforeAll(async () => {
		module = await e2eModule();
		app = module.createNestApplication();
		await app.init();
	});

	it('should not login on unknown user', () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send({userId: 99999, habitatId: 9999999} as LoginParameters)
			.expect(HttpStatus.UNAUTHORIZED);
	});

	it('should login on existing user', () => {
		return request(app.getHttpServer())
			.post('/auth/login')
			.send({userId: 1, habitatId: 1} as LoginParameters)
			.expect(HttpStatus.CREATED)
			.expect({access_token: expect.stringContaining("Bearer")});
	});
});