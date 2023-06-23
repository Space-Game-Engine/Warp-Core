import { Injectable, Logger } from '@nestjs/common';
import { HabitatResourceModel } from '@warp-core/database';
import { ResourceCalculatorService } from '@warp-core/resources/resource-calculator.service';
import { DataSource, EntitySubscriberInterface, EventSubscriber } from 'typeorm';

@Injectable()
@EventSubscriber()
export class HabitatResourceRecalculateSubscriber implements EntitySubscriberInterface<HabitatResourceModel> {
    private readonly logger = new Logger(HabitatResourceRecalculateSubscriber.name);

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
        this.logger.debug(`Calculating resources for resource ${entity.resourceId} for habitat ${entity.habitatId}`);
        await this.resourceCalculator.calculateSingleResource(entity);
        this.logger.debug(`Resources calculated for resource ${entity.resourceId} for habitat ${entity.habitatId}`);
    }
}

