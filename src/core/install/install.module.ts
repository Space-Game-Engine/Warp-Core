import {DynamicModule, Module, Type} from '@nestjs/common';
import {MultiBar, Presets} from 'cli-progress';

import {InstallCommand} from './install.command';
import {LoadConfigService} from './service/load-config.service';

import {
	INSTALLER_SERVICES,
	PROGRESS_BAR,
} from '@warp-core/core/install/installation.constants';
import {GameInstallerService} from '@warp-core/core/install/service/game-installer.service';
import {ModuleInstallationInterfaceType} from '@warp-core/core/install/service/module-installation.interface';
import {DatabaseModule} from '@warp-core/database/database.module';

type SingleInstallToken = {
	module: Type;
	service: ModuleInstallationInterfaceType;
};

@Module({})
export class InstallModule {
	public static readonly installTokens: Set<SingleInstallToken> = new Set();

	public static register(): DynamicModule {
		return {
			module: InstallModule,
			providers: [
				LoadConfigService,
				InstallCommand,
				{
					provide: INSTALLER_SERVICES,
					useFactory: (...args: ModuleInstallationInterfaceType[]) => args,
					inject: this.getInstallationServices(),
				},
				GameInstallerService,
				{
					provide: PROGRESS_BAR,
					useFactory: (): MultiBar => {
						return new MultiBar(
							{
								clearOnComplete: false,
								hideCursor: true,
								format: ' {bar} | {step_name} | {value}/{total}',
							},
							Presets.shades_grey,
						);
					},
				},
			],
			imports: [DatabaseModule, ...this.getModules()],
		};
	}

	private static getModules(): Type[] {
		return Array.from(this.installTokens).map(value => value.module);
	}

	private static getInstallationServices(): ModuleInstallationInterfaceType[] {
		return Array.from(this.installTokens).map(value => value.service);
	}
}
