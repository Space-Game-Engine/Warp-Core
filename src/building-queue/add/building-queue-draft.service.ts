import {Injectable} from '@nestjs/common';

import {PrepareSingleBuildingQueueElementService} from '@warp-core/building-queue/add/prepare-single-building-queue-element.service';
import {AddToQueueInput} from '@warp-core/building-queue/input/add-to-queue.input';
import {
	DraftModelInterface,
	PrepareDraftModelServiceInterface,
} from '@warp-core/core/utils';

@Injectable()
export class BuildingQueueDraftService
	implements PrepareDraftModelServiceInterface
{
	constructor(
		private readonly prepareQueueElement: PrepareSingleBuildingQueueElementService,
	) {}

	public async getDraft(
		addToQueueElement: AddToQueueInput,
	): Promise<DraftModelInterface> {
		return this.prepareQueueElement.getQueueElement(addToQueueElement);
	}
}
