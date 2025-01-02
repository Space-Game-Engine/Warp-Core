import {IsBoolean, IsNumber, Min} from 'class-validator';

export class BuildingZoneConfig {
	/**
	 * How much building zones are there for new habitat?
	 */
	@Min(1)
	@IsNumber()
	public counterForNewHabitat: number;

	/**
	 * Can user create new building zones?
	 */
	@IsBoolean()
	public isPossibleToCreateNewZones: boolean;
}
