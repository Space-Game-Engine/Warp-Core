import {plainToInstance} from 'class-transformer';
import {IsEnum, validateSync} from 'class-validator';

enum Environment {
	Local = 'localhost',
	Test = 'test',
}

class EnvironmentVariables {
	@IsEnum(Environment)
	public NODE_ENV: Environment = Environment.Local;
}

export function validate(
	config: Record<string, unknown>,
): EnvironmentVariables {
	const validatedConfig = plainToInstance(EnvironmentVariables, config, {
		enableImplicitConversion: true,
	});
	const errors = validateSync(validatedConfig, {
		skipMissingProperties: false,
	});

	if (errors.length > 0) {
		throw new Error(errors.toString());
	}
	return validatedConfig;
}
