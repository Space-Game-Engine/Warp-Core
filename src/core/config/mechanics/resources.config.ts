import {IsString} from 'class-validator';

export class ResourcesMechanicsConfig {
	@IsString()
	public calculation: string = 'simple';

	@IsString()
	public warehouse: string = 'base-resource-summary';
}
