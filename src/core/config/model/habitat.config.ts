import {Type} from 'class-transformer';
import {IsOptional, ValidateNested} from 'class-validator';

import {BuildingZoneConfig} from './building-zones.config';
import {QueueConfig} from './queue.config';

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
	@Type(() => QueueConfig)
	@ValidateNested()
	public buildingQueue: QueueConfig;

	/**
	 * Configuration related to research queue
	 */
	@Type(() => QueueConfig)
	@ValidateNested()
	public researchQueue: QueueConfig;

	/**
	 * What should game do when user create its first habitat
	 */
	@Type(() => OnStartConfig)
	@ValidateNested()
	@IsOptional()
	public onStart: OnStartConfig;
}
