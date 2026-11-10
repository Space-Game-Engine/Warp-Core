import {Type} from 'class-transformer';
import {IsString, ValidateNested} from 'class-validator';

export class SingleQueueMechanicsConfig {
	@IsString()
	public resourceConsumer: string = 'simple-resource-consumer';
}

export class QueueMechanicsConfig {
	@Type(() => SingleQueueMechanicsConfig)
	@ValidateNested()
	public building: SingleQueueMechanicsConfig;

	@Type(() => SingleQueueMechanicsConfig)
	@ValidateNested()
	public research: SingleQueueMechanicsConfig;
}
