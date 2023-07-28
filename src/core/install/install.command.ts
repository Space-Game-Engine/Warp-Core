import {Command, Option} from 'nestjs-command';
import {Injectable} from '@nestjs/common';
import {LoadConfigService} from './load-config.service';
import {BuildingInstallService} from '@warp-core/core/install/service/building-install.service';
import {ResourcesInstallService} from '@warp-core/core/install/service/resources-install.service';

@Injectable()
export class InstallCommand {
	constructor(
		private readonly buildingInstall: BuildingInstallService,
		private readonly resourceInstall: ResourcesInstallService,
		private readonly loadConfig: LoadConfigService,
	) {}

	@Command({
		command: 'install',
		describe: 'installs basics of game data',
	})
	async install(
		@Option({
			name: 'directory',
			describe: 'directory where yaml files are placed',
			type: 'string',
			alias: 'd',
			default: __dirname + '/../../../install',
			required: false,
		})
		directory: string,
	) {
		const installationConfig = this.loadConfig.fetchConfig(directory);

		await this.resourceInstall.install(installationConfig.resources);
		await this.buildingInstall.install(installationConfig.buildings);
	}
}
