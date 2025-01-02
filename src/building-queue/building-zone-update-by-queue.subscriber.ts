import {Injectable, Logger} from '@nestjs/common';
import {DataSource, EntitySubscriberInterface, EventSubscriber} from 'typeorm';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {BuildingQueueHandlerService} from '@warp-core/building-queue/building-queue-handler.service';
import {BuildingZoneModel} from '@warp-core/database';

@Injectable()
@EventSubscriber()
export class BuildingZoneUpdateByQueueSubscriber
	implements EntitySubscriberInterface<BuildingZoneModel>
{
	private readonly logger = new Logger(
		BuildingZoneUpdateByQueueSubscriber.name,
	);

	constructor(
		private readonly dataSource: DataSource,
		private readonly buildingQueueHandler: BuildingQueueHandlerService,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {
		dataSource.subscribers.push(this);
	}

	public listenTo(): typeof BuildingZoneModel {
		return BuildingZoneModel;
	}

	public async afterLoad(entity: BuildingZoneModel): Promise<void> {
		if (!this.habitatModel.id) {
			return;
		}

		this.logger.debug(`Resolving queue for building zone with id ${entity.id}`);
		await this.buildingQueueHandler.resolveQueueForSingleBuildingZone(entity);
		this.logger.debug(`Queue for building zone with id ${entity.id} resolved`);
	}
}
