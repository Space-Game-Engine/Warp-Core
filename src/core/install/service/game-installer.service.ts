import {Inject, Injectable} from '@nestjs/common';
import {
	ModuleInstallationInterface,
} from '@warp-core/core/install/service/module-installation.interface';
import {LoadConfigService} from '@warp-core/core/install/service/load-config.service';
import {INSTALLER_SERVICES} from '@warp-core/core/install/installation.constants';

@Injectable()
export class GameInstallerService {

	constructor(
		@Inject(INSTALLER_SERVICES)
		private readonly installers: ModuleInstallationInterface<any>[],
		private readonly loadConfig: LoadConfigService,
	) {}

	public async installGame(directory: string) {
		const loadedConfig = this.loadInstallationConfig(directory);

		for (const singleInstaller of this.installers) {
			singleInstaller.loadModels(loadedConfig);
			await singleInstaller.install();
		}
	}

	private loadInstallationConfig(directory: string) {
		return this.loadConfig.fetchConfig(directory);
	}
}