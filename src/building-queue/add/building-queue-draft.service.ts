import {PrepareSingleBuildingQueueElementService} from '@warp-core/building-queue/add/prepare-single-building-queue-element.service';
import {
	DraftModelInterface,
	PrepareDraftModelServiceInterface,
} from '@warp-core/core/utils';
import {AddToQueueInput} from '@warp-core/building-queue/input/add-to-queue.input';
import {Injectable} from '@nestjs/common';

@Injectable()
export class BuildingQueueDraftService
	implements PrepareDraftModelServiceInterface
{
	constructor(
		private readonly prepareQueueElement: PrepareSingleBuildingQueueElementService,
	) {}

	async getDraft(
		addToQueueElement: AddToQueueInput,
	): Promise<DraftModelInterface> {
		return this.prepareQueueElement.getQueueElement(addToQueueElement);
	}
}
