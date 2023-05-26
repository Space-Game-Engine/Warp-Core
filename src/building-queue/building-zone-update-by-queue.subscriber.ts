import { Injectable } from '@nestjs/common';
import { BuildingQueueHandlerService } from '@warp-core/building-queue/building-queue-handler.service';
import { BuildingZoneModel } from '@warp-core/database';
import { DataSource, EntitySubscriberInterface, EventSubscriber } from 'typeorm';

@Injectable()
@EventSubscriber()
export class BuildingZoneUpdateByQueueSubscriber implements EntitySubscriberInterface<BuildingZoneModel> {

    constructor(
        private readonly dataSource: DataSource,
        private readonly buildingQueueHandler: BuildingQueueHandlerService,
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return BuildingZoneModel;
    }

    async afterLoad(entity: BuildingZoneModel) {
        await this.buildingQueueHandler.resolveQueue();
    }
}

