import {Type} from 'class-transformer';
import {IsOptional, ValidateNested} from 'class-validator';

import {HabitatBuildingsConfig} from '@warp-core/core/config/model/habitat-buildings.config';
import {HabitatResourcesConfig} from '@warp-core/core/config/model/habitat-resources.config';

export class OnStartConfig {
	/**
	 * What kind of resources are available on game start?
	 */
	@Type(() => HabitatResourcesConfig)
	@ValidateNested()
	@IsOptional()
	public resources: HabitatResourcesConfig[];

	/**
	 * What kind of buildings are build at the beginning of the game?
	 */
	@Type(() => HabitatBuildingsConfig)
	@ValidateNested()
	@IsOptional()
	public buildings: HabitatBuildingsConfig[];
}
