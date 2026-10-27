import {HttpStatus, INestApplication} from '@nestjs/common';

import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Get list of research nodes', () => {
	let requestTest: GraphqlRequestTest;
	let app: INestApplication;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		return requestTest.registerAndAuthenticate(1);
	});

	it('should return all research nodes when user is authenticated', async () => {
		const response = await requestTest
			.query({
				root: 'researchNode_getAll',
				fields: {
					fields: ['id', 'name'],
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.researchNode_getAll).toHaveLength(5);
		expect(response.body.data.researchNode_getAll).toEqual(
			expect.arrayContaining([
				{id: 'basic_metallurgy', name: 'Basic metallurgy'},
				{id: 'free_research', name: 'Free research'},
				{id: 'expensive_research', name: 'Expensive research'},
				{id: 'advanced_metallurgy', name: 'Advanced metallurgy'},
				{id: 'steel_engineering', name: 'Steel engineering'},
			]),
		);
	});
});
