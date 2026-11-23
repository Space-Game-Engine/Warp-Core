import {Injectable} from '@nestjs/common';

import {AddMechanic} from '@warp-core/core/utils/mechanics';
import {QueueElementCostModel} from '@warp-core/database/model/queue-element-cost.model';
import {UnitBlueprintGlobalModel} from '@warp-core/database/model/unit/unit-blueprint-global.model';
import {AbstractQueueCostCalculationService} from '@warp-core/user/queue/core';
import {UnitQueueResourceConsumerInterface} from '@warp-core/user/queue/unit-queue/add/calculate-resources/unit-queue-resource-consumer.interface';
import {AddUnitToQueueInput} from '@warp-core/user/queue/unit-queue/input/add-unit-to-queue.input';

@Injectable()
@AddMechanic(UnitQueueResourceConsumerInterface, 'simple-resource-consumer')
export class SimpleUnitCalculationService
	extends AbstractQueueCostCalculationService
	implements UnitQueueResourceConsumerInterface
{
	public async calculateResourcesCosts(
		addToQueueElement: AddUnitToQueueInput,
		unit: UnitBlueprintGlobalModel,
	): Promise<QueueElementCostModel[]> {
		return this.sumRequirementsForAmount(
			(await unit.requirements) ?? [],
			addToQueueElement.amount,
		);
	}
}
