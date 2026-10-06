import {IsBoolean, IsNumber, Min} from 'class-validator';

export class QueueConfig {
	/**
	 * How many elements can be there in a single queue?
	 */
	@Min(1)
	@IsNumber()
	public maxElementsInQueue: number;

	/**
	 * Can user update a single entity by multiple levels?
	 */
	@IsBoolean()
	public allowMultipleLevelUpdate: boolean;
}
