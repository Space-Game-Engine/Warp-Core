import {UnprocessableEntityException} from '@nestjs/common';
import {InsufficientResourceType} from '@warp-core/resources/exception/insufficient-resource.type';

export class InsufficientResourcesException extends UnprocessableEntityException {
	constructor(
		public readonly insufficientResources: InsufficientResourceType[],
	) {
		super({resource: insufficientResources}, 'Insufficient resources');
	}
}
