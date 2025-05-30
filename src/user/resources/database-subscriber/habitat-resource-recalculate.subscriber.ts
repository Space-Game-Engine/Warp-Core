import {Injectable, Logger} from '@nestjs/common';
import {DataSource, EntitySubscriberInterface, EventSubscriber} from 'typeorm';

import {AuthorizedHabitatModel} from '@warp-core/auth';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';
import {ResourceCalculatorService} from '@warp-core/user/resources/service/calculate/resource-calculator.service';

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

	public listenTo(): typeof HabitatResourceModel {
		return HabitatResourceModel;
	}

	public async afterLoad(entity: HabitatResourceModel): Promise<void> {
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
