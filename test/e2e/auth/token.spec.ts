import {HttpStatus, INestApplication} from '@nestjs/common';
import * as request from 'supertest';

import {LoginParameters} from '@warp-core/auth/login/login-parameters.model';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

const startTimestamp = 1760083810;
const tokenRegex = /(^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$)/;

describe('Token', () => {
	let requestTest: GraphqlRequestTest;
	let app: INestApplication;
	const userId = 10;
	let loginParameters: LoginParameters;
	let loginToken: string;
	const tokenExpirationInSeconds = 3600;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());
		jest.useFakeTimers().setSystemTime(new Date(startTimestamp * 1000));
		loginParameters = await requestTest.register(userId);
		loginToken = await requestTest.authenticate(loginParameters);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should login token be created', () => {
		expect(loginToken).toMatch(tokenRegex);
	});

	it('should return profile info', async () => {
		const profileResponse = await request(app.getHttpServer())
			.get(`/auth/profile`)
			.set('Authorization', requestTest.prepareAuthHeader())
			.expect(HttpStatus.OK);

		const profileData = profileResponse.body;

		expect(profileData.id).toEqual(loginParameters.habitatId);
		expect(profileData.userId).toEqual(loginParameters.userId);
		expect(profileData.iat).toEqual(startTimestamp);
		expect(profileData.exp).toEqual(startTimestamp + tokenExpirationInSeconds);
	});

	it('should refresh token with new iat and exp date', async () => {
		const prolongedTimestamp = startTimestamp + 3000;
		jest.useFakeTimers().setSystemTime(new Date(prolongedTimestamp * 1000));

		const refreshedTokenResponse = await request(app.getHttpServer())
			.get(`/auth/refreshToken`)
			.set('Authorization', requestTest.prepareAuthHeader())
			.expect(HttpStatus.OK);
		const refreshedToken = refreshedTokenResponse.body.access_token;

		expect(refreshedToken).toMatch(tokenRegex);

		const profileResponse = await request(app.getHttpServer())
			.get(`/auth/profile`)
			.set('Authorization', `Bearer ${refreshedToken}`)
			.expect(HttpStatus.OK);

		const profileData = profileResponse.body;

		expect(profileData.id).toEqual(loginParameters.habitatId);
		expect(profileData.userId).toEqual(loginParameters.userId);
		expect(profileData.iat).toEqual(prolongedTimestamp);
		expect(profileData.exp).toEqual(
			prolongedTimestamp + tokenExpirationInSeconds,
		);
	});

	it('should not refresh token', () => {
		const prolongedTimestamp = startTimestamp + 9999;
		jest.useFakeTimers().setSystemTime(new Date(prolongedTimestamp * 1000));

		return request(app.getHttpServer())
			.get(`/auth/refreshToken`)
			.set('Authorization', requestTest.prepareAuthHeader())
			.expect(HttpStatus.UNAUTHORIZED);
	});
});
