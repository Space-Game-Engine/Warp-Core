import {Injectable} from '@nestjs/common';
import {Command, Option} from 'nestjs-command';

import {GameInstallerService} from '@warp-core/core/install/service/game-installer.service';
import {LoadConfigService} from '@warp-core/core/install/service/load-config.service';

@Injectable()
export class InstallCommand {
	constructor(
		private readonly gameInstaller: GameInstallerService,
		private readonly loadConfig: LoadConfigService,
	) {}

	@Command({
		command: 'install',
		describe: 'installs basics of game data',
	})
	public async install(
		@Option({
			name: 'directory',
			describe: 'directory where yaml files are placed',
			type: 'string',
			alias: 'd',
			default: __dirname + '/../../../install',
			demandOption: false,
		})
		directory: string,
	): Promise<void> {
		const installationConfig = this.loadConfig.fetchConfig(directory);

		await this.gameInstaller.installGame(installationConfig);
	}
}
