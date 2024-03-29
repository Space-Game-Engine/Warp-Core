import {Logger, Type} from '@nestjs/common';
import {plainToInstance} from 'class-transformer';
import {validateSync} from 'class-validator';
import {ModuleInstallationInterface} from '@warp-core/core/install/service/module-installation.interface';
import {LoadedConfig} from '@warp-core/core/install/service/load-config.service';
import {InstallError} from '@warp-core/core/install/exception/install.error';
import {InstallValidationError} from '@warp-core/core/install/exception/install-validation.error';

export abstract class AbstractInstallationService<T>
	implements ModuleInstallationInterface<T>
{
	protected static readonly logger: Logger = new Logger('installation');

	protected modelsList: T[] = [];

	loadModels(loadedConfig: LoadedConfig): T[] {
		const arrayToInstall = this.parseConfig(loadedConfig);

		for (const key in arrayToInstall) {
			if (Object.prototype.hasOwnProperty.call(arrayToInstall, key) === false) {
				continue;
			}
			const elementsToInstall = arrayToInstall[key];
			const modelToSave = plainToInstance(
				this.modelType(),
				elementsToInstall,
			) as T;

			this.preValidationObject(modelToSave);

			this.isModelValid(modelToSave);

			this.postValidationObject(modelToSave);

			this.modelsList.push(modelToSave);
		}

		return this.modelsList;
	}

	protected isModelValid(model: any): boolean {
		const validationErrors = validateSync(model);

		if (validationErrors.length === 0) {
			return true;
		}

		AbstractInstallationService.logger.error('Validation error');
		AbstractInstallationService.logger.error(validationErrors);
		throw new InstallValidationError('Validation error, see logs');
	}

	/**
	 * Allows modifying an object **before** validation
	 * @param modelToSave
	 * @protected
	 */
	protected preValidationObject(modelToSave: T): T {
		return modelToSave;
	}


	/**
	 * Allows modifying an object **after** validation
	 * @param modelToSave
	 * @protected
	 */
	protected postValidationObject(modelToSave: T): T {
		return modelToSave;
	}

	protected abstract modelType(): Type<T>;

	/**
	 * @throws {InstallError}
	 * @param loadedConfig
	 * @protected
	 */
	protected abstract parseConfig(loadedConfig: LoadedConfig): T[];
}
