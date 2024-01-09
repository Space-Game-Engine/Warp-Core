import {Type} from '@nestjs/common';
import {LoadedConfig} from '@warp-core/core/install/service/load-config.service';

export interface ModuleInstallationInterface<T>{
	/**
	 * Load models to install and proceed with validation
	 *
	 * @param {LoadedConfig} loadedConfig
	 */
	loadModels(loadedConfig: LoadedConfig): void;

	/**
	 * Proceeds with installation of already loaded models
	 */
	install(): Promise<void>;
}

export type ModuleInstallationInterfaceType = Type<ModuleInstallationInterface<any>>;