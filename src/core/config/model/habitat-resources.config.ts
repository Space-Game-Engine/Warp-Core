import {IsNumber, IsPositive, IsString, Min} from 'class-validator';

export class HabitatResourcesConfig {
	/**
	 * Resource id from `resource` table
	 */
	@IsString()
	id: string;

	/**
	 * How many resources user will have at the beginning?
	 */
	@IsNumber()
	@IsPositive()
	amount: number;
}
