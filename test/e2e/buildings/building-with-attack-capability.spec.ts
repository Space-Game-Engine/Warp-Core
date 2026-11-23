import {HttpStatus, INestApplication} from '@nestjs/common';

import {BuildingRoleEnum} from '@warp-core/database/enum/building-role.enum';
import {CapabilityTargetTypeEnum} from '@warp-core/database/enum/capability-target-type.enum';
import {BuildingBlueprintGlobalRepository} from '@warp-core/database/repository/building-blueprint-global.repository';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Building with attack capability', () => {
	let requestTest: GraphqlRequestTest;
	let app: INestApplication;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		// repository.create() is required to persist lazy relations
		const buildingRepository = app.get(BuildingBlueprintGlobalRepository);
		await buildingRepository.save(
			buildingRepository.create({
				id: 'defense_tower',
				role: BuildingRoleEnum.WAREHOUSE_ONLY,
				name: 'Defense tower',
				buildingDetailsAtCertainLevel: [
					{
						details: {level: 1, timeToUpdateInSeconds: 10},
						capabilities: {
							attack: {
								damage: 20,
								cooldown: 3,
								targets: [
									{
										type: CapabilityTargetTypeEnum.MOVEMENT_LAYER,
										value: 'land',
									},
									{type: CapabilityTargetTypeEnum.TAG, value: 'infantry'},
								],
							},
						},
					},
				],
			} as never),
		);

		return requestTest.registerAndAuthenticate(1);
	});

	it('should return building that is able to attack', async () => {
		const response = await requestTest
			.query({
				root: 'building_getAll',
				fields: {
					fields: ['id'],
					buildingDetailsAtCertainLevel: {
						details: {fields: ['level']},
						capabilities: {
							attack: {
								fields: ['damage', 'cooldown'],
								targets: {fields: ['type', 'value']},
							},
						},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors).toBeUndefined();

		const buildings = response.body.data.building_getAll;
		const tower = buildings.find(
			(building: {id: string}) => building.id === 'defense_tower',
		);

		expect(tower.buildingDetailsAtCertainLevel).toHaveLength(1);
		expect(tower.buildingDetailsAtCertainLevel[0].capabilities.attack).toEqual({
			damage: 20,
			cooldown: 3,
			targets: [
				{type: 'MOVEMENT_LAYER', value: 'land'},
				{type: 'TAG', value: 'infantry'},
			],
		});

		const buildingsWithoutAttack = buildings.filter(
			(building: {id: string}) => building.id !== 'defense_tower',
		);
		for (const building of buildingsWithoutAttack) {
			for (const level of building.buildingDetailsAtCertainLevel) {
				expect(level.capabilities?.attack ?? null).toBeNull();
			}
		}
	});
});
