import {IsBoolean, IsNumber, Min} from 'class-validator';

export class BuildingQueueConfig {
	/**
	 * How many elements can be there in single building queue?
	 */
	@Min(1)
	@IsNumber()
	public maxElementsInQueue: number;

	/**
	 * Can user update single buildings by multiple levels?
	 */
	@IsBoolean()
	public allowMultipleLevelUpdate: boolean;
}
