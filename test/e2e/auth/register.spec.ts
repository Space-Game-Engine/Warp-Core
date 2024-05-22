import {HttpStatus, INestApplication} from '@nestjs/common';
import * as request from 'supertest';

import {LoginParameters} from '@warp-core/auth/login/login-parameters.model';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/e2e-module';

describe('register', () => {
	let app: INestApplication;
	let config: RuntimeConfig;

	beforeAll(async () => {
		app = await createNestApplicationE2E();

		config = app.get(RuntimeConfig);
	});

	it('should create a new habitat when user was not registered already', () => {
		const newUserId = 9999;

		config.habitat.onStart = {
			resources: [],
			buildings: [],
		};

		return request(app.getHttpServer()).get(`/auth/create/${newUserId}`).expect(HttpStatus.OK).expect({
			userId: newUserId,
			habitatId: 2,
		});
	});

	it('should create a new habitat and allow user to login when user was not registered already', async () => {
		const newUserId = 9999;

		config.habitat.onStart = {
			resources: [],
			buildings: [],
		};

		const registerResponse = await request(app.getHttpServer()).get(`/auth/create/${newUserId}`).expect(HttpStatus.OK);

		expect(registerResponse.body).toHaveProperty('userId');
		expect(registerResponse.body.userId).toEqual(newUserId);
		expect(registerResponse.body).toHaveProperty('habitatId');
		expect(registerResponse.body.habitatId).toBe(2);

		const loginResponse = await request(app.getHttpServer())
			.post('/auth/login')
			.send({userId: newUserId, habitatId: 2} as LoginParameters)
			.expect(HttpStatus.CREATED);

		expect(loginResponse.body).toHaveProperty('access_token');
		expect(loginResponse.body.access_token).toContain('Bearer');
	});
});
