import {QueueInputValidation} from '@warp-core/user/queue/building-queue/input/validator/type';

export interface QueueItemValidatorInterface {
	validate(input: QueueInputValidation): Promise<void>;
}
