import {Injectable} from '@nestjs/common';

import {ResearchQueueElementModel} from '@warp-core/database/model/research-queue-element.model';
import {AbstractQueueDraftService} from '@warp-core/user/queue/core';
import {PrepareSingleResearchQueueElementService} from '@warp-core/user/queue/research-queue/add/prepare-single-research-queue-element.service';
import {AddResearchToQueueInput} from '@warp-core/user/queue/research-queue/input/add-research-to-queue.input';

@Injectable()
export class ResearchQueueDraftService extends AbstractQueueDraftService<
	AddResearchToQueueInput,
	ResearchQueueElementModel
> {
	constructor(prepareQueueElement: PrepareSingleResearchQueueElementService) {
		super(prepareQueueElement);
	}
}
