import {sumCapabilities} from '@warp-core/core/utils/capabilities/sum-capabilities.util';
import {ResourceTypeEnum} from '@warp-core/database/enum/resource-type.enum';
import {StorageTypeEnum} from '@warp-core/database/enum/storage-type.enum';
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

describe('Sum capabilities util', () => {
	describe('sumCapabilities', () => {
		it('should return empty capabilities when there are no sources', async () => {
			const result = await sumCapabilities([null, undefined]);

			expect(result.production).toEqual([]);
			expect(result.storage).toEqual([]);
		});

		it('should copy production and storage when there is single source', async () => {
			const result = await sumCapabilities([
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
			const result = await sumCapabilities([
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
			const result = await sumCapabilities([
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
			const result = await sumCapabilities([
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
	});
});
