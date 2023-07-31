import {Logger, Type} from '@nestjs/common';
import {plainToInstance} from 'class-transformer';
import {validateSync} from 'class-validator';

export function AbstractInstalatorService<T extends Type<unknown>>(
	classRef: T,
): any {
	abstract class AbstractInstalatorServiceClass {

		protected static readonly logger: Logger = new Logger('installation');
		async install(arrayToInstall: any) {
			for (const key in arrayToInstall) {
				if (
					Object.prototype.hasOwnProperty.call(arrayToInstall, key) === false
				) {
					continue;
				}
				const elementsToInstall = arrayToInstall[key];
				const modelToSave = plainToInstance(classRef, elementsToInstall) as T;

				await this.isModelValid(modelToSave);

				await this.saveModel(modelToSave);
			}
		}

		protected async isModelValid(model: any): Promise<boolean> {
			const validationErrors = validateSync(model);

			if (validationErrors.length === 0) {
				return true;
			}

			AbstractInstalatorServiceClass.logger.error('Validation error');
			AbstractInstalatorServiceClass.logger.error(validationErrors);
			throw new Error('Validation error, see logs');
		}

		protected abstract saveModel(modelToSave: T): Promise<void>;
	}
	return AbstractInstalatorServiceClass;
}
