import {Injectable} from '@nestjs/common';

import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {PrepareSingleBuildingQueueElementService} from '@warp-core/user/queue/building-queue/add/prepare-single-building-queue-element.service';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {AbstractQueueDraftService} from '@warp-core/user/queue/core';

@Injectable()
export class BuildingQueueDraftService extends AbstractQueueDraftService<
	AddToQueueInput,
	BuildingQueueElementModel
> {
	constructor(prepareQueueElement: PrepareSingleBuildingQueueElementService) {
		super(prepareQueueElement);
	}
}
