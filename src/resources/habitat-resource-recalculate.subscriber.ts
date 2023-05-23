import { Injectable } from '@nestjs/common';
import { HabitatResourceModel } from '@warp-core/database/model/habitat-resource.model';
import { ResourceCalculatorService } from '@warp-core/resources/resource-calculator.service';
import { DataSource, EntitySubscriberInterface, EventSubscriber } from 'typeorm';

@Injectable()
@EventSubscriber()
export class HabitatResourceRecalculateSubscriber implements EntitySubscriberInterface<HabitatResourceModel> {

    constructor(
        private readonly dataSource: DataSource,
        private readonly resourceCalculator: ResourceCalculatorService,
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return HabitatResourceModel;
    }

    async afterLoad(entity: HabitatResourceModel) {
        await this.resourceCalculator.calculateSingleResource(entity);
    }
}

