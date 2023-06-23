import { Injectable, Logger } from '@nestjs/common';
import { BuildingQueueHandlerService } from '@warp-core/building-queue/building-queue-handler.service';
import { BuildingZoneModel } from '@warp-core/database';
import { DataSource, EntitySubscriberInterface, EventSubscriber } from 'typeorm';

@Injectable()
@EventSubscriber()
export class BuildingZoneUpdateByQueueSubscriber implements EntitySubscriberInterface<BuildingZoneModel> {
    private readonly logger = new Logger(BuildingZoneUpdateByQueueSubscriber.name);

    constructor(
        private readonly dataSource: DataSource,
        private readonly buildingQueueHandler: BuildingQueueHandlerService,
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return BuildingZoneModel;
    }

    async afterLoad(entity: BuildingZoneModel, event?) {
        this.logger.debug(`Resolving queue for building zone with id ${entity.id}`);
        await this.buildingQueueHandler.resolveQueueForSingleBuildingZone(entity);
        this.logger.debug(`Queue for building zone with id ${entity.id} resolved`);
    }
}

