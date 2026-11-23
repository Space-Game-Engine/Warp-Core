import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {InternalEmitterError} from '@warp-core/core/utils/internal-exchange';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {UnitQueueElementModel} from '@warp-core/database/model/unit-queue-element.model';
import {UnitQueueRepository} from '@warp-core/database/repository/unit-queue.repository';
import {UnitQueryEmitter} from '@warp-core/global/unit';
import {AbstractPrepareQueueElementService} from '@warp-core/user/queue/core';
import {QueueError} from '@warp-core/user/queue/core/exception/queue.error';
import {UnitQueueResourceConsumerInterface} from '@warp-core/user/queue/unit-queue/add/calculate-resources/unit-queue-resource-consumer.interface';
import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';

@Injectable()
export class PrepareSingleUnitQueueElementService extends AbstractPrepareQueueElementService<
	AddUnitToQueueInput,
	UnitQueueElementModel
> {
	constructor(
		protected readonly calculationService: UnitQueueResourceConsumerInterface,
		protected readonly unitQueueRepository: UnitQueueRepository,
		protected readonly unitQueryEmitter: UnitQueryEmitter,
		protected readonly habitatModel: AuthorizedHabitatModel,
	) {
		super(unitQueueRepository);
	}

	protected async createDraftQueueElement(
		addToQueueElement: AddUnitToQueueInput,
	): Promise<UnitQueueElementModel> {
		const unit = await this.getUnitById(addToQueueElement.unitId);

		const resourceCost = await this.calculationService.calculateResourcesCosts(
			addToQueueElement,
			unit,
		);

		return this.unitQueueRepository.create({
			id: null,
			unit: unit,
			unitId: unit.id,
			habitatId: this.habitatModel.id,
			amount: addToQueueElement.amount,
			startTime: new Date(),
			endTime: new Date(),
			isConsumed: false,
			costs: resourceCost,
		});
	}

	protected async calculateUpgradeTimeInSeconds(
		queueElement: UnitQueueElementModel,
	): Promise<number> {
		const unit = await queueElement.unit;

		return unit.timeToBuildInSeconds * queueElement.amount;
	}

	private async getUnitById(unitId: string): Promise<UnitBlueprintGlobalModel> {
		const {data, error} = await this.unitQueryEmitter.getUnitById(unitId);

		if (error) {
			throw new InternalEmitterError(error.message);
		}

		if (!data) {
			throw new QueueError('Failed to get unit');
		}

		return data;
	}
}
