import {Test, TestingModule} from '@nestjs/testing';
import {when} from 'jest-when';

import {SumCapabilitiesService} from '@warp-core/core/utils';
import {CalculatedCapabilitiesModel} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {UnitInstanceModel} from '@warp-core/database/model/unit/unit-instance.model';
import {CalculateUnitInstanceCapabilitiesService} from '@warp-core/user/unit-instance/service/calculate-unit-instance-capabilities.service';

jest.mock('@warp-core/core/utils/capabilities/sum-capabilities.service');

describe('Calculate unit instance capabilities service', () => {
	let calculateUnitInstanceCapabilitiesService: CalculateUnitInstanceCapabilitiesService;
	let sumCapabilitiesService: jest.Mocked<SumCapabilitiesService>;

	beforeEach(async () => {
		jest.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CalculateUnitInstanceCapabilitiesService,
				SumCapabilitiesService,
			],
		}).compile();

		calculateUnitInstanceCapabilitiesService = module.get(
			CalculateUnitInstanceCapabilitiesService,
		);
		sumCapabilitiesService = module.get(SumCapabilitiesService);
	});

	describe('forUnitInstance', () => {
		it('should sum global blueprint capabilities with player blueprint bonuses', async () => {
			const globalCapabilities = {id: 1} as CapabilitiesModel;
			const bonusCapabilities = {id: 2} as CapabilitiesModel;
			const summed = new CalculatedCapabilitiesModel();
			const unitInstance = {
				getPlayerBlueprint: async (): Promise<unknown> => ({
					capabilities: bonusCapabilities,
					getGlobalBlueprint: async (): Promise<unknown> => ({
						capabilities: globalCapabilities,
					}),
				}),
			} as unknown as UnitInstanceModel;

			when(sumCapabilitiesService.sum)
				.expectCalledWith([globalCapabilities, bonusCapabilities])
				.mockResolvedValueOnce(summed);

			expect(
				await calculateUnitInstanceCapabilitiesService.forUnitInstance(
					unitInstance,
				),
			).toBe(summed);
		});
	});
});
