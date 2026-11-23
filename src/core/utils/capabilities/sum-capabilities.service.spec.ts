import {Test, TestingModule} from '@nestjs/testing';

import {ProductionCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/production-capability.aggregator';
import {StorageCapabilityAggregator} from '@warp-core/core/utils/capabilities/aggregator/storage-capability.aggregator';
import {CapabilityAggregatorInterface} from '@warp-core/core/utils/capabilities/capability-aggregator.interface';
import {CAPABILITY_AGGREGATORS} from '@warp-core/core/utils/capabilities/capability-aggregators.token';
import {SumCapabilitiesService} from '@warp-core/core/utils/capabilities/sum-capabilities.service';
import {ResourceTypeEnum} from '@warp-core/database/enum/resource-type.enum';
import {StorageTypeEnum} from '@warp-core/database/enum/storage-type.enum';
import {CalculatedCapabilitiesModel} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

function capabilities(input: {
	production?: {resourceId: string; amount: number; interval: number}[];
	storage?: {
		storageType: StorageTypeEnum;
		amount: number;
		resourceType?: ResourceTypeEnum;
		resourceId?: string;
	}[];
}): CapabilitiesModel {
	return input as unknown as CapabilitiesModel;
}

describe('Sum capabilities service', () => {
	let sumCapabilitiesService: SumCapabilitiesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SumCapabilitiesService,
				ProductionCapabilityAggregator,
				StorageCapabilityAggregator,
				{
					provide: CAPABILITY_AGGREGATORS,
					useFactory: (...aggregators: unknown[]): unknown[] => aggregators,
					inject: [ProductionCapabilityAggregator, StorageCapabilityAggregator],
				},
			],
		}).compile();

		sumCapabilitiesService = module.get(SumCapabilitiesService);
	});

	describe('sum', () => {
		it('should return empty capabilities when there are no sources', async () => {
			const result = await sumCapabilitiesService.sum([null, undefined]);

			expect(result.production).toEqual([]);
			expect(result.storage).toEqual([]);
		});

		it('should copy production and storage when there is single source', async () => {
			const result = await sumCapabilitiesService.sum([
				capabilities({
					production: [{resourceId: 'wood', amount: 3, interval: 2}],
					storage: [{storageType: StorageTypeEnum.ANY_RESOURCE, amount: 100}],
				}),
			]);

			expect(result.production).toEqual([
				{resourceId: 'wood', amount: 3, interval: 2, amountPerSecond: 1.5},
			]);
			expect(result.storage).toEqual([
				{
					storageType: StorageTypeEnum.ANY_RESOURCE,
					resourceType: null,
					resourceId: null,
					amount: 100,
				},
			]);
		});

		it('should sum production per resource and rescale bonus flows to the first interval', async () => {
			const result = await sumCapabilitiesService.sum([
				capabilities({
					production: [
						{resourceId: 'wood', amount: 1, interval: 1},
						{resourceId: 'coal', amount: 2, interval: 4},
					],
				}),
				capabilities({
					production: [{resourceId: 'wood', amount: 1, interval: 2}],
				}),
			]);

			expect(result.production).toEqual([
				{resourceId: 'wood', amount: 1.5, interval: 1, amountPerSecond: 1.5},
				{resourceId: 'coal', amount: 2, interval: 4, amountPerSecond: 0.5},
			]);
		});

		it('should merge storage with the same rules and keep different rules separate', async () => {
			const result = await sumCapabilitiesService.sum([
				capabilities({
					storage: [
						{storageType: StorageTypeEnum.ANY_RESOURCE, amount: 100},
						{
							storageType: StorageTypeEnum.ONE_KIND_OF_RESOURCE,
							resourceId: 'wood',
							amount: 10,
						},
					],
				}),
				capabilities({
					storage: [
						{storageType: StorageTypeEnum.ANY_RESOURCE, amount: 50},
						{
							storageType: StorageTypeEnum.ONE_TYPE_OF_RESOURCE,
							resourceType: ResourceTypeEnum.ENERGY_RESOURCE,
							amount: 20,
						},
					],
				}),
			]);

			expect(result.storage).toEqual([
				{
					storageType: StorageTypeEnum.ANY_RESOURCE,
					resourceType: null,
					resourceId: null,
					amount: 150,
				},
				{
					storageType: StorageTypeEnum.ONE_KIND_OF_RESOURCE,
					resourceType: null,
					resourceId: 'wood',
					amount: 10,
				},
				{
					storageType: StorageTypeEnum.ONE_TYPE_OF_RESOURCE,
					resourceType: ResourceTypeEnum.ENERGY_RESOURCE,
					resourceId: null,
					amount: 20,
				},
			]);
		});

		it('should resolve lazy relations when source comes from database', async () => {
			const result = await sumCapabilitiesService.sum([
				{
					production: Promise.resolve([
						{resourceId: 'wood', amount: 2, interval: 1},
					]),
					storage: Promise.resolve(null),
				} as unknown as CapabilitiesModel,
			]);

			expect(result.production).toEqual([
				{resourceId: 'wood', amount: 2, interval: 1, amountPerSecond: 2},
			]);
			expect(result.storage).toEqual([]);
		});

		it('should use additional aggregators without changes in the service', async () => {
			class CountAggregator extends CapabilityAggregatorInterface<{
				count: number;
			}> {
				public createState(): {count: number} {
					return {count: 0};
				}

				public async addSource(state: {count: number}): Promise<void> {
					state.count++;
				}

				public applyToResult(
					state: {count: number},
					result: CalculatedCapabilitiesModel,
				): void {
					(result as unknown as {sources: number}).sources = state.count;
				}
			}
			const service = new SumCapabilitiesService([new CountAggregator()]);

			const result = await service.sum([
				capabilities({}),
				null,
				capabilities({}),
			]);

			expect((result as unknown as {sources: number}).sources).toBe(2);
		});
	});
});
