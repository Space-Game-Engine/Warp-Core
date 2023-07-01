import {UnprocessableEntityException} from "@nestjs/common";

export class QueueValidationError extends UnprocessableEntityException {
    constructor(public readonly validationError:  {[p: string]: string[]}) {
        super(validationError, 'Queue validation error');
    }}
