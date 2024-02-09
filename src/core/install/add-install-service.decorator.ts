import {
	ModuleInstallationInterfaceType,
} from '@warp-core/core/install/service/module-installation.interface';
import {InstallModule} from '@warp-core/core/install/install.module';
import {Type} from '@nestjs/common';

export function AddInstallService(installService: ModuleInstallationInterfaceType): ClassDecorator {
	return (target: Function) => {
		InstallModule.installTokens.add({
			module: target as Type<any>,
			service: installService
		})
	}
}