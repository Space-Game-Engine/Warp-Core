import {IsNumber, IsPositive, IsString} from 'class-validator';

export class HabitatResourcesConfig {
	/**
	 * Resource id from `resource` table
	 */
	@IsString()
	public id: string;

	/**
	 * How many resources user will have at the beginning?
	 */
	@IsNumber()
	@IsPositive()
	public amount: number;
}
