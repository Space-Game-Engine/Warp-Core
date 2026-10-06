import {Injectable} from '@nestjs/common';

import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingQueueRepository} from '@warp-core/database/repository/building-queue.repository';
import {PrepareSingleBuildingQueueElementService} from '@warp-core/user/queue/building-queue/add/prepare-single-building-queue-element.service';
import {BuildingQueueAddEmitter} from '@warp-core/user/queue/building-queue/exchange/emit/building-queue-add.emitter';
import {AddToQueueInput} from '@warp-core/user/queue/building-queue/input/add-to-queue.input';
import {AbstractQueueAddService} from '@warp-core/user/queue/core';

@Injectable()
export class BuildingQueueAddService extends AbstractQueueAddService<
	AddToQueueInput,
	BuildingQueueElementModel
> {
	constructor(
		prepareQueueElement: PrepareSingleBuildingQueueElementService,
		buildingQueueRepository: BuildingQueueRepository,
		buildingQueueAddEmitter: BuildingQueueAddEmitter,
	) {
		super(prepareQueueElement, buildingQueueRepository, buildingQueueAddEmitter);
	}
}
