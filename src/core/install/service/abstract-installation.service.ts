import {Logger, Type} from '@nestjs/common';
import {plainToInstance} from 'class-transformer';
import {validateSync} from 'class-validator';
import {EntityManager} from 'typeorm';

import {InstallValidationError} from '@warp-core/core/install/exception/install-validation.error';
import {LoadedConfig} from '@warp-core/core/install/service/load-config.service';
import {ModuleInstallationInterface} from '@warp-core/core/install/service/module-installation.interface';

export abstract class AbstractInstallationService<T extends object>
	implements ModuleInstallationInterface<T>
{
	protected static readonly logger: Logger = new Logger('installation');

	protected entityManager: EntityManager | undefined;

	protected modelsList: T[] = [];

	public setEntityManager(entityManager: EntityManager): void {
		this.entityManager = entityManager;
	}

	public loadModels(loadedConfig: LoadedConfig): T[] {
		const arrayToInstall = this.parseConfig(loadedConfig);

		for (const key in arrayToInstall) {
			if (Object.prototype.hasOwnProperty.call(arrayToInstall, key) === false) {
				continue;
			}
			const elementsToInstall = arrayToInstall[key];
			const modelToSave = this.prepareModel(elementsToInstall);
			this.preValidationObject(modelToSave);

			this.isModelValid(modelToSave);

			this.postValidationObject(modelToSave);

			this.modelsList.push(modelToSave);
		}

		return this.modelsList;
	}

	protected prepareModel(elementsToInstall: T): T {
		if (this.entityManager) {
			return this.entityManager.create(
				this.modelType(),
				elementsToInstall,
			) as T;
		} else {
			return plainToInstance(this.modelType(), elementsToInstall) as T;
		}
	}

	protected isModelValid(model: object): boolean {
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
