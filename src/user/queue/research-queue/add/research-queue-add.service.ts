import {Injectable} from '@nestjs/common';

import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {ResearchQueueRepository} from '@warp-core/database/repository/research-queue.repository';
import {PrepareSingleResearchQueueElementService} from '@warp-core/user/queue/research-queue/add/prepare-single-research-queue-element.service';
import {ResearchQueueAddEmitter} from '@warp-core/user/queue/research-queue/exchange/emit/research-queue-add.emitter';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';
import {AbstractQueueAddService} from '@warp-core/user/queue/core';

@Injectable()
export class ResearchQueueAddService extends AbstractQueueAddService<
	AddResearchToQueueInput,
	ResearchQueueElementModel
> {
	constructor(
		prepareQueueElement: PrepareSingleResearchQueueElementService,
		researchQueueRepository: ResearchQueueRepository,
		researchQueueAddEmitter: ResearchQueueAddEmitter,
	) {
		super(prepareQueueElement, researchQueueRepository, researchQueueAddEmitter);
	}
}
