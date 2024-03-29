import {Injectable, Logger} from '@nestjs/common';
import {HabitatResourceModel} from '@warp-core/database';
import {ResourceCalculatorService} from '@warp-core/resources/calculate/resource-calculator.service';
import {DataSource, EntitySubscriberInterface, EventSubscriber} from 'typeorm';
import {AuthorizedHabitatModel} from '@warp-core/auth';

@Injectable()
@EventSubscriber()
export class HabitatResourceRecalculateSubscriber
	implements EntitySubscriberInterface<HabitatResourceModel>
{
	private readonly logger = new Logger(
		HabitatResourceRecalculateSubscriber.name,
	);

	constructor(
		private readonly dataSource: DataSource,
		private readonly resourceCalculator: ResourceCalculatorService,
		private readonly habitatModel: AuthorizedHabitatModel,
	) {
		dataSource.subscribers.push(this);
	}

	listenTo() {
		return HabitatResourceModel;
	}

	async afterLoad(entity: HabitatResourceModel) {
		if (!this.habitatModel.id) {
			return;
		}

		this.logger.debug(
			`Calculating resources for resource ${entity.resourceId} for habitat ${entity.habitatId}`,
		);
		await this.resourceCalculator.calculateSingleResource(entity);
		this.logger.debug(
			`Resources calculated for resource ${entity.resourceId} for habitat ${entity.habitatId}`,
		);
	}
}
