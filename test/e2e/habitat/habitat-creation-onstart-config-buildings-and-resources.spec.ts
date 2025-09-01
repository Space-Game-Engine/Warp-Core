import {HttpStatus, INestApplication} from '@nestjs/common';
import {DateTime} from 'luxon';

import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {HabitatResourceCombined} from '@warp-core/database/model/habitat-resource.mapped.model';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Habitat Creation when onStart config contains buildings and resources', () => {
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;
	let config: RuntimeConfig;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		config = app.get(RuntimeConfig);
		config.habitat.onStart.buildings = [
			{
				id: 'warehouse',
				level: 1,
				localBuildingZoneId: 1,
			},
			{
				id: 'lumber_mill',
				level: 1,
				localBuildingZoneId: 2,
			},
		];
		config.habitat.onStart.resources = [
			{
				id: 'wood',
				amount: 10,
			},
			{
				id: 'stone_granite',
				amount: 20,
			},
			{
				id: 'coal',
				amount: 10,
			},
		];

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

	it('should have defined resources', async () => {
		const response = await requestTest
			.query({
				root: 'resource_getAll',
				fields: {
					fields: ['id', 'currentAmount'],
				},
			})
			.send()
			.expect(HttpStatus.OK);

		response.body.data.resource_getAll.forEach(
			(singleResource: Partial<HabitatResourceCombined>) => {
				let amountToExpect = 0;
				switch (singleResource.id) {
					case 'wood':
						amountToExpect = 10;
						break;
					case 'stone_granite':
						amountToExpect = 20;
						break;
					case 'coal':
						amountToExpect = 10;
						break;
					default:
						amountToExpect = 0;
				}

				expect(singleResource.currentAmount).toEqual(amountToExpect);
			},
		);
	});

	it('should have pre-build buildings on building zones', async () => {
		const response = await requestTest
			.query({
				root: 'buildingZone_getAll',
				fields: {
					fields: ['localBuildingZoneId', 'level'],
					building: {
						fields: ['id'],
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		for (const buildingZone of response.body.data.buildingZone_getAll) {
			switch (buildingZone.localBuildingZoneId) {
				case 1:
					expect(await buildingZone.building!.id).toEqual('warehouse');
					expect(buildingZone.level).toEqual(1);
					break;
				case 2:
					expect(await buildingZone.building!.id).toEqual('lumber_mill');
					expect(buildingZone.level).toEqual(1);
					break;
				default:
					expect(buildingZone.building).toBeNull();
			}
		}
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

	describe('See habitat resources after some time when coal mine produces resources', () => {
		beforeEach(() => {
			jest.useFakeTimers();
		});

		it('should have resources after 30 seconds', async () => {
			jest.setSystemTime(DateTime.now().plus({second: 30}).toJSDate());
			const response = await requestTest
				.query({
					root: 'resource_get',
					fields: {
						fields: ['id', 'currentAmount'],
					},
					variables: {
						id: {
							value: 'wood',
							type: 'ID',
						},
					},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(response.body.data.resource_get.currentAmount).toEqual(40);
		});

		it('should have resources after 10 minutes, but limited to warehouse capacity', async () => {
			jest.setSystemTime(DateTime.now().plus({minutes: 10}).toJSDate());
			const response = await requestTest
				.query({
					root: 'resource_get',
					fields: {
						fields: ['id', 'currentAmount'],
					},
					variables: {
						id: {
							value: 'wood',
							type: 'ID',
						},
					},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(response.body.data.resource_get.currentAmount).toEqual(100);
		});

		afterEach(() => {
			jest.useRealTimers();
		});
	});
});
