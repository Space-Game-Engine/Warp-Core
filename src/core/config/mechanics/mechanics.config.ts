import {Type} from 'class-transformer';
import {ValidateNested} from 'class-validator';

import {ResourcesMechanicsConfig} from '@warp-core/core/config/mechanics/resources.config';

export class MechanicsConfig {
	@Type(() => ResourcesMechanicsConfig)
	@ValidateNested()
	public resources: ResourcesMechanicsConfig;
}
