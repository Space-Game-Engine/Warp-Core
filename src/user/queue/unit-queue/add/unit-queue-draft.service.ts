import {Injectable} from '@nestjs/common';

import {UnitQueueElementModel} from '@warp-core/database/model/unit-queue-element.model';
import {AbstractQueueDraftService} from '@warp-core/user/queue/core';
import {PrepareSingleUnitQueueElementService} from '@warp-core/user/queue/unit-queue/add/prepare-single-unit-queue-element.service';
import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';

@Injectable()
export class UnitQueueDraftService extends AbstractQueueDraftService<
	AddUnitToQueueInput,
	UnitQueueElementModel
> {
	constructor(prepareQueueElement: PrepareSingleUnitQueueElementService) {
		super(prepareQueueElement);
	}
}
