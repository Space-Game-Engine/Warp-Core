import {HttpStatus, INestApplication} from '@nestjs/common';
import {DataSource} from 'typeorm';

import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';
import {HabitatRepository} from '@warp-core/database/repository/habitat.repository';
import {ResearchNodeRepository} from '@warp-core/database/repository/research-node.repository';
import {ResearchQueueRepository} from '@warp-core/database/repository/research-queue.repository';
import {requestGraphQL} from '@warp-core/test/e2e/utils/graphql-request-test';
import {GraphqlRequestTest} from '@warp-core/test/e2e/utils/graphql-request-test/graphql-request-test';
import {createNestApplicationE2E} from '@warp-core/test/e2e/utils/setup-tests';

describe('Research queue does not depend on database row order', () => {
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
		const researchQueueRepository = app.get(ResearchQueueRepository);
		const queueElementDetails = {
			habitatId: habitat.id,
			researchNodeId: 'free_research',
			isConsumed: false,
			costs: [],
		};

		await researchQueueRepository.save(
			researchQueueRepository.create({
				...queueElementDetails,
				startLevel: 1,
				endLevel: 2,
				startTime: new Date('2020-01-01T00:00:10Z'),
				endTime: new Date('2020-01-01T00:00:30Z'),
			}),
		);
		await researchQueueRepository.save(
			researchQueueRepository.create({
				...queueElementDetails,
				startLevel: 0,
				endLevel: 1,
				startTime: new Date('2020-01-01T00:00:00Z'),
				endTime: new Date('2020-01-01T00:00:10Z'),
			}),
		);

		const response = await requestTest
			.query({
				root: 'technology_getAll',
				fields: {
					fields: ['currentLevel'],
					researchNode: {
						fields: ['id'],
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.technology_getAll).toEqual([
			{currentLevel: 2, researchNode: {id: 'free_research'}},
		]);
	});

	it('should allow the highest level when level details are stored out of order', async () => {
		const researchNode = await app
			.get(ResearchNodeRepository)
			.getResearchNodeById('free_research');
		const [firstLevelDetails, secondLevelDetails] =
			await researchNode!.researchNodeDetailsAtCertainLevel;
		const detailsRepository = app
			.get(DataSource)
			.getRepository(DetailsAtCertainLevelModel);

		await detailsRepository.update(firstLevelDetails.detailsId, {level: 2});
		await detailsRepository.update(secondLevelDetails.detailsId, {level: 1});

		const response = await requestTest
			.mutation({
				root: 'researchQueue_add',
				operationName: 'AddResearchToQueue',
				fields: {
					fields: ['startLevel', 'endLevel'],
				},
				variables: {
					addToQueue: {
						type: 'AddResearchToQueueInput',
						value: {
							researchNodeId: 'free_research',
							endLevel: 2,
						},
					},
				},
			})
			.send()
			.expect(HttpStatus.OK);

		expect(response.body.errors).toBeUndefined();
		expect(response.body.data.researchQueue_add).toEqual({
			startLevel: 0,
			endLevel: 2,
		});
	});
});
