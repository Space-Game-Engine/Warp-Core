import {
	PipeTransform,
	ArgumentMetadata,
	BadRequestException,
} from '@nestjs/common';
import {validate} from 'class-validator';
import {plainToInstance} from 'class-transformer';

export abstract class CustomValidator<T extends object>
	implements PipeTransform<any>
{
	async transform(value: any, {metatype}: ArgumentMetadata) {
		if (!metatype || !this.isPossibleToValidate(metatype)) {
			return value;
		}
		const object = plainToInstance(metatype, value) as T;
		const errors = await validate(object);
		if (errors.length > 0) {
			throw new BadRequestException('Validation failed');
		}

		await this.customValidator(object);
		return value;
	}

	private isPossibleToValidate(metatype: Function): boolean {
		const types: Function[] = [String, Boolean, Number, Array, Object];
		return !types.includes(metatype);
	}

	protected abstract customValidator(value: T): boolean | Promise<boolean>;
}
