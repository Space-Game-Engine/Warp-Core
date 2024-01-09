import {Command, Option} from 'nestjs-command';
import {Injectable} from '@nestjs/common';
import {GameInstallerService} from '@warp-core/core/install/service/game-installer.service';

@Injectable()
export class InstallCommand {
	constructor(
		private readonly gameInstaller: GameInstallerService,
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
			demandOption: false,
		})
		directory: string,
	) {
		await this.gameInstaller.installGame(directory);
	}
}
