import {IsNumber, IsOptional, IsString, Min} from 'class-validator';

export class HabitatBuildingsConfig {
	/**
	 * Id of the building from `building` table
	 */
	@IsString()
	public id: string;

	/**
	 * Building zone id from habitat - there will be placed a new building
	 */
	@IsNumber()
	@Min(1)
	public localBuildingZoneId: number;

	/**
	 * What level should new building have?
	 */
	@IsNumber()
	@Min(1)
	@IsOptional()
	public level: number = 1;
}
