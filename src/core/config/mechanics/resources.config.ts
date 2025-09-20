import {IsString} from 'class-validator';

export class ResourcesMechanicsConfig {
	@IsString()
	public calculation: string = 'simple';
}
