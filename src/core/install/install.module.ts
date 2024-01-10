import {DynamicModule, Module, Type} from '@nestjs/common';
import {MultiBar, Presets} from 'cli-progress';
import {InstallCommand} from './install.command';
import {LoadConfigService} from './service/load-config.service';
import {ModuleInstallationInterfaceType} from '@warp-core/core/install/service/module-installation.interface';
import {GameInstallerService} from '@warp-core/core/install/service/game-installer.service';
import {INSTALLER_SERVICES, PROGRESS_BAR} from '@warp-core/core/install/installation.constants';

type singleInstallToken = {
	module: Type<any>,
	service: ModuleInstallationInterfaceType
}


@Module({})
export class InstallModule {
	public static readonly installTokens: Set<singleInstallToken> = new Set();

	static register(): DynamicModule {
		return {
			module: InstallModule,
			providers: [
				LoadConfigService,
				InstallCommand,
				{
					provide: INSTALLER_SERVICES,
					useFactory: (...args: ModuleInstallationInterfaceType[]) => args,
					inject: this.getInstallationServices()
				},
				GameInstallerService,
				{
					provide: PROGRESS_BAR,
					useFactory: () => {
						return new MultiBar({
							clearOnComplete: false,
							hideCursor: true,
							format: ' {bar} | {step_name} | {value}/{total}',
						}, Presets.shades_grey);
		}
				}
			],
			imports: [
				...this.getModules()
			]
		}
	}

	private static getModules(): Type<any>[] {
		return Array.from(this.installTokens).map(value => value.module);
	}

	private static getInstallationServices(): ModuleInstallationInterfaceType[] {
		return Array.from(this.installTokens).map(value => value.service);
	}
}
