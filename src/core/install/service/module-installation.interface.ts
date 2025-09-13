import {Type} from '@nestjs/common';
import {EntityManager} from 'typeorm';

import {LoadedConfig} from '@warp-core/core/install/service/load-config.service';

export interface ModuleInstallationInterface<T> {
	/**
	 * Load models to install and proceed with validation
	 *
	 * @param {LoadedConfig} loadedConfig
	 */
	loadModels(loadedConfig: LoadedConfig): T[];

	setEntityManager(entityManager: EntityManager): void;
}

export type ModuleInstallationInterfaceType = Type<
	ModuleInstallationInterface<object>
>;
