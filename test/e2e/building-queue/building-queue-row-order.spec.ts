import {HttpStatus, INestApplication} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {BuildingZoneRepository} from '@warp-core/database/repository/building-zone.repository';
import {BuildingRepository} from '@warp-core/database/repository/building.repository';
import {HabitatRepository} from '@warp-core/database/repository/habitat.repository';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Building queue does not depend on database row order', () => {
	const userId = 2;
	let app: INestApplication;
	let requestTest: GraphqlRequestTest;

	beforeEach(async () => {
		app = await createNestApplicationE2E();
		requestTest = requestGraphQL(app.getHttpServer());

		return requestTest.registerAndAuthenticate(userId);
	});

	it('should end on the highest level when finished queue elements are stored newest first', async () => {
		const [habitat] = await app
			.get(HabitatRepository)
			.getHabitatsByUserId(userId);
		const buildingZones = await app
			.get(BuildingZoneRepository)
			.getAllBuildingZonesByHabitatId(habitat.id);
		const university = buildingZones.find(
			buildingZone => buildingZone.localBuildingZoneId === 2,
		)!;
		const buildingQueueRepository = app.get(BuildingQueueRepository);
		const queueElementDetails = {
			buildingZoneId: university.id,
			buildingId: 'university',
			isConsumed: false,
			costs: [],
		};

		await buildingQueueRepository.save(
			buildingQueueRepository.create({
				...queueElementDetails,
				startLevel: 2,
				endLevel: 3,
				startTime: new Date('2020-01-01T00:00:10Z'),
				endTime: new Date('2020-01-01T00:00:30Z'),
			}),
		);
		await buildingQueueRepository.save(
			buildingQueueRepository.create({
				...queueElementDetails,
				startLevel: 1,
				endLevel: 2,
				startTime: new Date('2020-01-01T00:00:00Z'),
				endTime: new Date('2020-01-01T00:00:10Z'),
			}),
		);

		const response = await requestTest
			.query({
				root: 'buildingZone_get',
				fields: {
					fields: ['level'],
				},
				variables: {
					localBuildingZoneId: {
						value: 2,
						type: 'Int',
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.buildingZone_get.level).toEqual(3);
	});

	it('should allow the highest level when level details are stored out of order', async () => {
		const building = await app
			.get(BuildingRepository)
			.getBuildingById('warehouse');
		const [firstLevelDetails, secondLevelDetails] =
			await building!.buildingDetailsAtCertainLevel;
		const detailsRepository = app
			.get(DataSource)
			.getRepository(DetailsAtCertainLevelModel);

		await detailsRepository.update(firstLevelDetails.detailsId, {level: 2});
		await detailsRepository.update(secondLevelDetails.detailsId, {level: 1});

		const response = await requestTest
			.mutation({
				root: 'buildingQueue_add',
				operationName: 'AddToQueue',
				fields: {
					fields: ['startLevel', 'endLevel'],
				},
				variables: {
					addToQueue: {
						type: 'AddToQueueInput',
						value: {
							localBuildingZoneId: 1,
							endLevel: 2,
						},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.buildingQueue_add).toEqual({
			startLevel: 1,
			endLevel: 2,
		});
	});
});
