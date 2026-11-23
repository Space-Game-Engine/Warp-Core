import {Injectable} from '@nestjs/common';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {InternalEmitterError} from '@warp-core/core/utils/internal-exchange';
import {UnitQueueElementModel} from '@warp-core/database/model/unit-queue-element.model';
import {UnitQueueRepository} from '@warp-core/database/repository/unit-queue.repository';
import {AbstractQueueHandlerService} from '@warp-core/user/queue/core';
import {UnitQueueProcessingEmitter} from '@warp-core/user/queue/unit-queue/exchange/emit/unit-queue-processing.emitter';
import {UnitInstanceQueryEmitter} from '@warp-core/user/unit-instance';

@Injectable()
export class UnitQueueHandlerService extends AbstractQueueHandlerService<UnitQueueElementModel> {
	constructor(
		unitQueueRepository: UnitQueueRepository,
		habitatModel: AuthorizedHabitatModel,
		unitQueueEmitter: UnitQueueProcessingEmitter,
		private readonly unitInstanceEmitter: UnitInstanceQueryEmitter,
	) {
		super(unitQueueRepository, habitatModel, unitQueueEmitter);
	}

	protected async applyQueueElement(
		queueElement: UnitQueueElementModel,
	): Promise<void> {
		this.logger.debug(
			`Creating ${queueElement.amount} units with id ${queueElement.unitId}`,
		);

		const {error} = await this.unitInstanceEmitter.createUnitInstances({
			habitatId: queueElement.habitatId,
			unitId: queueElement.unitId,
			amount: queueElement.amount,
		});

		if (error) {
			throw new InternalEmitterError(error.message);
		}
	}
}
