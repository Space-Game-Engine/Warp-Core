import {IsNumber, Min} from 'class-validator';

export class UnitQueueConfig {
	/**
	 * How many elements can be there in a single queue?
	 */
	@Min(1)
	@IsNumber()
	public maxElementsInQueue: number;
}
