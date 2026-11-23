import {Injectable} from '@nestjs/common';

import {UnitQueueElementModel} from '@warp-core/database/model/unit-queue-element.model';
import {UnitQueueRepository} from '@warp-core/database/repository/unit-queue.repository';
import {AbstractQueueAddService} from '@warp-core/user/queue/core';
import {PrepareSingleUnitQueueElementService} from '@warp-core/user/queue/unit-queue/add/prepare-single-unit-queue-element.service';
import {UnitQueueAddEmitter} from '@warp-core/user/queue/unit-queue/exchange/emit/unit-queue-add.emitter';
import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';

@Injectable()
export class UnitQueueAddService extends AbstractQueueAddService<
	AddUnitToQueueInput,
	UnitQueueElementModel
> {
	constructor(
		prepareQueueElement: PrepareSingleUnitQueueElementService,
		unitQueueRepository: UnitQueueRepository,
		unitQueueAddEmitter: UnitQueueAddEmitter,
	) {
		super(prepareQueueElement, unitQueueRepository, unitQueueAddEmitter);
	}
}
