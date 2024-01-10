import {Inject, Injectable} from '@nestjs/common';
import {
	ModuleInstallationInterface,
} from '@warp-core/core/install/service/module-installation.interface';
import {LoadConfigService} from '@warp-core/core/install/service/load-config.service';
import {INSTALLER_SERVICES, PROGRESS_BAR} from '@warp-core/core/install/installation.constants';
import {MultiBar, SingleBar} from 'cli-progress';
import {DataSource} from 'typeorm';

@Injectable()
export class GameInstallerService {

	private readonly mainProgressBar: SingleBar;

	constructor(
		@Inject(INSTALLER_SERVICES)
		private readonly installers: ModuleInstallationInterface<any>[],
		private readonly loadConfig: LoadConfigService,
		@Inject(PROGRESS_BAR)
		private readonly progressBar: MultiBar,
		private readonly dataSource: DataSource,
	) {
		this.mainProgressBar = this.progressBar.create(this.getProgressBarSteps(), 0);
	}
	
	private getProgressBarSteps(): number {
		return this.installers.length + 2;
	}

	public async installGame(directory: string) {
		const loadedConfig = this.loadInstallationConfig(directory);
		const models: object[] = [];

		for (const singleInstaller of this.installers) {
			this.mainProgressBar.increment({
				step_name: `Loading models from ${singleInstaller.constructor.name}`,
			});
			models.push(...singleInstaller.loadModels(loadedConfig));
		}

		this.mainProgressBar.increment({
			step_name: `Saving data to database`,
		});
		await this.dataSource.manager.save(models);

		this.mainProgressBar.increment({
			step_name: `All steps are finished`,
		});

		this.progressBar.stop();
	}

	private loadInstallationConfig(directory: string) {
		return this.loadConfig.fetchConfig(directory);
	}
}