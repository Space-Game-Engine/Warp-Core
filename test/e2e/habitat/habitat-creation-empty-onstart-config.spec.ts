import {HttpStatus, INestApplication} from '@nestjs/common';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/e2e-module';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingZoneModel, HabitatResourceCombined} from '@warp-core/database';

describe('Habitat Creation when onStart config is empty', () => {

	let app: INestApplication;
	let requestTest: GraphqlRequestTest;
	let config: RuntimeConfig;

	beforeEach(async () => {
		app = await createNestApplicationE2E();

		requestTest = requestGraphQL(app.getHttpServer());
		config = app.get(RuntimeConfig);
		config.habitat.onStart.buildings = [];
		config.habitat.onStart.resources = [];

		return requestTest.registerAndAuthenticate(2);
	});

	it('should have habitat id when user is registered', async () => {
		const response = await requestTest
			.query({
				root: 'habitat_get',
				fields: {
					fields: ['name', 'id'],
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.data.habitat_get.id).toMatch(/\d+/);
	});

	it('should not have any resources', async () => {
		console.log('run test for empty config', config.habitat.onStart);
		const response = await requestTest
			.query({
				root: 'resource_getAll',
				fields: {
					fields: ['id', 'currentAmount'],
				},
			})
			.send()
			.expect(HttpStatus.OK);

		response.body.data.resource_getAll.forEach((singleResource: Partial<HabitatResourceCombined>) => {
			expect(singleResource.currentAmount).toEqual(0);
		});
	});

	it('should not have any pre-build buildings on building zones', async () => {
		const response = await requestTest
			.query({
				root: 'buildingZone_getAll',
				fields: {
					fields: ['localBuildingZoneId'],
					building: {
						fields: ['id'],
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		response.body.data.buildingZone_getAll.forEach((buildingZone: Partial<BuildingZoneModel>) => {
			expect(buildingZone.building).toBeNull();
		});
	});

	it('should have empty building queue', async () => {
		const response = await requestTest
			.query({
				root: 'buildingQueue_getAll',
				fields: {
					fields: ['id'],
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.data.buildingQueue_getAll).toHaveLength(0);
	});

});