import {Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction} from 'connect';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingQueueHandlerService} from '@warp-core/user/queue/building-queue/building-queue-handler.service';

@Injectable()
export class QueueConsumerMiddleware implements NestMiddleware {
	public constructor(
		private readonly habitatModel: AuthorizedHabitatModel,
		private readonly buildingQueueHandlerService: BuildingQueueHandlerService,
	) {}

	public async use(
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		if (this.habitatModel.id) {
			await this.buildingQueueHandlerService.resolveQueue();
		}

		next();
	}
}
