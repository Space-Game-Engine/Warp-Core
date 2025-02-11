import {Type} from 'class-transformer';
import {IsOptional, ValidateNested} from 'class-validator';

import {BuildingQueueConfig} from './building-queue.config';
import {BuildingZoneConfig} from './building-zones.config';

import {OnStartConfig} from '@warp-core/core/config/model/on-start.config';

export class HabitatConfig {
	/**
	 * Configuration related to building zones on
	 * user habitat
	 */
	@Type(() => BuildingZoneConfig)
	@ValidateNested()
	public buildingZones: BuildingZoneConfig;

	/**
	 * Configuration related to building queue
	 */
	@Type(() => BuildingQueueConfig)
	@ValidateNested()
	public buildingQueue: BuildingQueueConfig;

	/**
	 * What should game do when user create its first habitat
	 */
	@Type(() => OnStartConfig)
	@ValidateNested()
	@IsOptional()
	public onStart: OnStartConfig;
}
