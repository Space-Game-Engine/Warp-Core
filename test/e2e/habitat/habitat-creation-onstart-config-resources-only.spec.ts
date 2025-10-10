import {HttpStatus, INestApplication} from '@nestjs/common';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Habitat Creation when onStart config contains resources', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;
	let config: RuntimeConfig;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		config = app.get(RuntimeConfig);
		config.habitat.onStart.buildings = [];
		config.habitat.onStart.resources = [
			{
				id: 'wood',
				amount: 100,
			},
			{
				id: 'stone_granite',
				amount: 200,
			},
			{
				id: 'coal',
				amount: 50,
			},
		];
		config.mechanics.resources.warehouse = 'disabled';

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

		response.body.data.buildingZone_getAll.forEach(
			(buildingZone: Partial<BuildingZoneModel>) => {
				expect(buildingZone.building).toBeNull();
			},
		);
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

	it('should have resources on start', async () => {
		const response = await requestTest
			.query({
				root: 'resource_getAll',
				fields: {
					fields: ['id', 'currentAmount', 'productionRate'],
				},
			})
			.send()
			.expect(HttpStatus.OK);

		const resourcesFromResponse = response.body.data.resource_getAll;

		expect(resourcesFromResponse).toHaveResourceWithValue({
			resourceId: 'wood',
			value: 100,
		});
		expect(resourcesFromResponse).toHaveResourceWithCustomProperty({
			resourceId: 'wood',
			property: 'productionRate',
			value: 0,
		});
		expect(resourcesFromResponse).toHaveResourceWithValue({
			resourceId: 'stone_granite',
			value: 200,
		});
		expect(resourcesFromResponse).toHaveResourceWithCustomProperty({
			resourceId: 'stone_granite',
			property: 'productionRate',
			value: 0,
		});
		expect(resourcesFromResponse).toHaveResourceWithValue({
			resourceId: 'coal',
			value: 50,
		});
		expect(resourcesFromResponse).toHaveResourceWithCustomProperty({
			resourceId: 'coal',
			property: 'productionRate',
			value: 0,
		});
	});
});
