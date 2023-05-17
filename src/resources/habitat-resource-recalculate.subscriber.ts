import { Injectable } from '@nestjs/common';
import { HabitatResourceModel } from '@warp-core/database/model/habitat-resource.model';
import { DataSource, EntitySubscriberInterface, EventSubscriber } from 'typeorm';

@Injectable()
@EventSubscriber()
export class HabitatResourceRecalculateSubscriber implements EntitySubscriberInterface<HabitatResourceModel> {

    constructor(
        private readonly dataSource: DataSource,
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return HabitatResourceModel;
    }

    async afterLoad(entity: HabitatResourceModel) {
    }
}

