import {
	PipeTransform,
	ArgumentMetadata,
	BadRequestException,
} from '@nestjs/common';
import {plainToInstance} from 'class-transformer';
import {validate} from 'class-validator';

export abstract class CustomValidator<T extends object>
	implements PipeTransform<T>
{
	public async transform(value: T, {metatype}: ArgumentMetadata): Promise<T> {
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

	private isPossibleToValidate(metatype): boolean {
		const types = [String, Boolean, Number, Array, Object];
		return !types.includes(metatype);
	}

	protected abstract customValidator(value: T): boolean | Promise<boolean>;
}
