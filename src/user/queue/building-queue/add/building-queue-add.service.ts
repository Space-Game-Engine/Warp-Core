import {Injectable} from '@nestjs/common';

import {ProcessAndConsumeResourcesServiceInterface} from '@warp-core/core/utils';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {PrepareSingleBuildingQueueElementService} from '@warp-core/user/queue/building-queue/add/prepare-single-building-queue-element.service';
import {BuildingQueueAddEmitter} from '@warp-core/user/queue/building-queue/exchange/emit/building-queue-add.emitter';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';

@Injectable()
export class BuildingQueueAddService
	implements ProcessAndConsumeResourcesServiceInterface
{
	constructor(
		private readonly prepareQueueElement: PrepareSingleBuildingQueueElementService,
		protected readonly buildingQueueRepository: BuildingQueueRepository,
		private readonly buildingQueueAddEmitter: BuildingQueueAddEmitter,
	) {}

	public async processAndConsumeResources(
		addToQueueElement: AddToQueueInput,
	): Promise<BuildingQueueElementModel> {
		const draftQueueElement =
			await this.prepareQueueElement.getQueueElement(addToQueueElement);

		await this.buildingQueueAddEmitter.beforeAddingElement({
			queueElement: draftQueueElement,
		});

		await this.buildingQueueRepository.startTransaction();

		try {
			const queueElement =
				await this.buildingQueueRepository.save(draftQueueElement);

			await this.buildingQueueAddEmitter.afterAddingElement({queueElement});

			await this.buildingQueueRepository.commitTransaction();

			return queueElement;
		} catch (e) {
			await this.buildingQueueRepository.rollbackTransaction();
			throw e;
		}
	}
}
