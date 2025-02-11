import {Inject, Injectable} from '@nestjs/common';
import {MultiBar, SingleBar} from 'cli-progress';
import {DataSource} from 'typeorm';

import {
	INSTALLER_SERVICES,
	PROGRESS_BAR,
} from '@warp-core/core/install/installation.constants';
import {LoadedConfig} from '@warp-core/core/install/service/load-config.service';
import {ModuleInstallationInterface} from '@warp-core/core/install/service/module-installation.interface';
import {InstallationDetailsRepository} from '@warp-core/database/repository/installation-details.repository';

@Injectable()
export class GameInstallerService {
	private readonly mainProgressBar: SingleBar;

	constructor(
		private readonly installationDetailsRepository: InstallationDetailsRepository,
		@Inject(INSTALLER_SERVICES)
		private readonly installers: ModuleInstallationInterface<object>[],
		@Inject(PROGRESS_BAR)
		private readonly progressBar: MultiBar,
		private readonly dataSource: DataSource,
	) {
		this.mainProgressBar = this.progressBar.create(
			this.getProgressBarSteps(),
			0,
		);
	}

	private getProgressBarSteps(): number {
		return this.installers.length + 2;
	}

	public async installGame(loadedConfig: LoadedConfig): Promise<void> {
		if (
			(await this.installationDetailsRepository.isPossibleToInstallGame()) ===
			false
		) {
			this.skipInstallationProcess();
			return;
		}

		const models = this.loadGameModels(loadedConfig);
		await this.saveGameModelsToDatabase(models);
		await this.logIntoRegister();

		this.progressBar.stop();
	}

	private skipInstallationProcess(): void {
		this.mainProgressBar.update(this.getProgressBarSteps(), {
			step_name: 'Game already installed, process skipped',
		});
		this.mainProgressBar.stop();
	}

	private loadGameModels(loadedConfig: LoadedConfig): object[] {
		const models: object[] = [];

		for (const singleInstaller of this.installers) {
			this.mainProgressBar.increment({
				step_name: `Loading models from ${singleInstaller.constructor.name}`,
			});
			models.push(...singleInstaller.loadModels(loadedConfig));
		}

		return models;
	}

	private async saveGameModelsToDatabase(models: object[]): Promise<void> {
		this.mainProgressBar.increment({
			step_name: `Saving data to database`,
		});

		await this.dataSource.manager.save(models);

		this.mainProgressBar.increment({
			step_name: `All steps are finished`,
		});
	}

	private async logIntoRegister(): Promise<void> {
		await this.installationDetailsRepository.insert({});
	}
}
