import {HttpStatus, INestApplication} from '@nestjs/common';

import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Unit definitions', () => {
	let requestTest: GraphqlRequestTest;
	let app: INestApplication;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());
	});

	it('should not return units list when user is not authenticated', async () => {
		const response = await requestTest
			.query({root: 'unit_getAll', fields: {fields: ['name']}})
			.send();

		expect(response.body.errors[0].message).toBe('Unauthorized');
	});

	describe('as authenticated user', () => {
		beforeEach(() => requestTest.registerAndAuthenticate(1));

		it('should return all installed units', async () => {
			const response = await requestTest
				.query({root: 'unit_getAll', fields: {fields: ['id', 'name']}})
				.send()
				.expect(HttpStatus.OK);

			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.unit_getAll).toHaveLength(3);
			expect(response.body.data.unit_getAll).toEqual(
				expect.arrayContaining([
					{id: 'light_tank', name: 'Light tank'},
					{id: 'gun_turret', name: 'Gun turret'},
				]),
			);
		});

		it('should return single unit with build requirements and capabilities', async () => {
			const response = await requestTest
				.query({
					root: 'unit_get',
					fields: {
						fields: ['name', 'timeToBuildInSeconds'],
						tags: {fields: ['tag']},
						requirements: {fields: ['resourceId', 'cost', 'buildingId']},
						capabilities: {
							movement: {fields: ['layer', 'speed']},
							storage: {fields: ['amount', 'carriesUnits']},
							attack: {
								fields: ['damage', 'cooldown'],
								targets: {fields: ['type', 'value']},
							},
							defense: {fields: ['armor']},
							detection: {fields: ['sightRange', 'detectsStealth']},
						},
					},
					variables: {id: {value: 'light_tank', type: 'ID'}},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(response.body.errors).toBeUndefined();
			const unit = response.body.data.unit_get;
			expect(unit.name).toBe('Light tank');
			expect(unit.tags).toEqual([{tag: 'tank'}, {tag: 'ground'}]);
			expect(unit.timeToBuildInSeconds).toBe(60);
			expect(unit.requirements).toHaveLength(2);
			expect(unit.capabilities.movement).toEqual([{layer: 'land', speed: 5}]);
			expect(unit.capabilities.storage).toEqual([
				{amount: 10, carriesUnits: 1},
			]);
			expect(unit.capabilities.attack).toEqual({
				damage: 10,
				cooldown: 2,
				targets: [{type: 'MOVEMENT_LAYER', value: 'land'}],
			});
			expect(unit.capabilities.defense).toEqual({armor: 5});
			expect(unit.capabilities.detection).toEqual({
				sightRange: 8,
				detectsStealth: false,
			});
		});

		it('should return production capability', async () => {
			const response = await requestTest
				.query({
					root: 'unit_get',
					fields: {
						fields: ['name'],
						capabilities: {
							production: {fields: ['resourceId', 'amount', 'interval']},
							construction: {
								buildableUnits: {fields: ['unitBlueprintId']},
							},
						},
					},
					variables: {id: {value: 'gun_turret', type: 'ID'}},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(response.body.errors).toBeUndefined();
			expect(response.body.data.unit_get.capabilities.production).toEqual([
				{resourceId: 'coal', amount: 1, interval: 10},
			]);
			expect(response.body.data.unit_get.capabilities.construction).toBeNull();
		});

		it('should return healing targets and buildable units', async () => {
			const response = await requestTest
				.query({
					root: 'unit_get',
					fields: {
						fields: ['name'],
						capabilities: {
							healing: {
								fields: ['amount', 'interval'],
								targets: {fields: ['type', 'value']},
							},
							construction: {
								buildableUnits: {fields: ['unitBlueprintId']},
							},
						},
					},
					variables: {id: {value: 'engineer', type: 'ID'}},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(response.body.errors).toBeUndefined();
			const capabilities = response.body.data.unit_get.capabilities;
			expect(capabilities.healing).toEqual({
				amount: 1,
				interval: 5,
				targets: [{type: 'TAG', value: 'infantry'}],
			});
			expect(capabilities.construction.buildableUnits).toEqual([
				{unitBlueprintId: 'gun_turret'},
			]);
		});

		it('should return null when unit does not exist', async () => {
			const response = await requestTest
				.query({
					root: 'unit_get',
					fields: {fields: ['name']},
					variables: {id: {value: 'missing', type: 'ID'}},
				})
				.send()
				.expect(HttpStatus.OK);

			expect(response.body.data.unit_get).toBeNull();
		});
	});
});
