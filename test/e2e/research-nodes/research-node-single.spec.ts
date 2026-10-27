import {HttpStatus, INestApplication} from '@nestjs/common';

import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Get single research node with details', () => {
	let requestTest: GraphqlRequestTest;
	let app: INestApplication;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		return requestTest.registerAndAuthenticate(1);
	});

	it('should return single research node when user is authenticated', async () => {
		const response = await requestTest
			.query({
				root: 'researchNode_get',
				fields: {
					fields: ['name'],
				},
				variables: {
					id: {
						value: 'basic_metallurgy',
						type: 'ID',
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.data.researchNode_get.name).toEqual(
			'Basic metallurgy',
		);
	});

	it('should return single research node with its details when user is authenticated', async () => {
		const response = await requestTest
			.query({
				root: 'researchNode_get',
				fields: {
					fields: ['name'],
					researchNodeDetailsAtCertainLevel: {
						details: {
							fields: ['level', 'timeToUpdateInSeconds'],
						},
					},
				},
				variables: {
					id: {
						value: 'basic_metallurgy',
						type: 'ID',
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		const details =
			response.body.data.researchNode_get.researchNodeDetailsAtCertainLevel;

		expect(details).toHaveLength(3);
		expect(details[0].details.level).toEqual(1);
		expect(details[0].details.timeToUpdateInSeconds).toEqual(10);
		expect(details[1].details.level).toEqual(2);
		expect(details[2].details.level).toEqual(3);
	});

	it('should return required research nodes in level requirements when research node has prerequisites', async () => {
		const response = await requestTest
			.query({
				root: 'researchNode_get',
				fields: {
					fields: ['name'],
					researchNodeDetailsAtCertainLevel: {
						details: {
							fields: ['level'],
							requirements: {
								fields: ['researchNodeId', 'researchNodeLevel'],
							},
						},
					},
				},
				variables: {
					id: {
						value: 'steel_engineering',
						type: 'ID',
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors).toBeUndefined();
		const requirements =
			response.body.data.researchNode_get.researchNodeDetailsAtCertainLevel[0]
				.details.requirements;

		expect(requirements).toHaveLength(2);
		expect(requirements).toEqual(
			expect.arrayContaining([
				{researchNodeId: 'basic_metallurgy', researchNodeLevel: 2},
				{researchNodeId: 'advanced_metallurgy', researchNodeLevel: 1},
			]),
		);
	});

	it('should return null when research node does not exist', async () => {
		const response = await requestTest
			.query({
				root: 'researchNode_get',
				fields: {
					fields: ['name'],
				},
				variables: {
					id: {
						value: 'duck_research',
						type: 'ID',
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.researchNode_get).toBeNull();
	});
});
