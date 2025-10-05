import {Type} from 'class-transformer';
import {ValidateNested} from 'class-validator';

import {MechanicsConfig} from '@warp-core/core/config/mechanics/mechanics.config';
import {HabitatConfig} from '@warp-core/core/config/model/habitat.config';

export class RuntimeConfig {
	/**
	 * All configurations related to user habitat
	 */
	@Type(() => HabitatConfig)
	@ValidateNested()
	public habitat: HabitatConfig;

	@Type(() => MechanicsConfig)
	@ValidateNested()
	public mechanics: MechanicsConfig;
}
