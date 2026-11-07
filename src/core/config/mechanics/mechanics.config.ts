import {Type} from 'class-transformer';
import {ValidateNested} from 'class-validator';

import {QueueMechanicsConfig} from '@warp-core/core/config/mechanics/queue.config';
import {ResourcesMechanicsConfig} from '@warp-core/core/config/mechanics/resources.config';

export class MechanicsConfig {
	@Type(() => ResourcesMechanicsConfig)
	@ValidateNested()
	public resources: ResourcesMechanicsConfig;

	@Type(() => QueueMechanicsConfig)
	@ValidateNested()
	public queue: QueueMechanicsConfig;
}
