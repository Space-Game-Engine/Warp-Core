import {Type} from 'class-transformer';
import {ValidateNested} from 'class-validator';

import {HabitatConfig} from '@warp-core/core/config/model/habitat.config';

export class RuntimeConfig {
	/**
	 * All configurations related to user habitat
	 */
	@Type(() => HabitatConfig)
	@ValidateNested()
	public habitat: HabitatConfig;
}
