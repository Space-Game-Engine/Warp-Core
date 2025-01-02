import {Type} from '@nestjs/common';

import {InstallModule} from '@warp-core/core/install/install.module';
import {ModuleInstallationInterfaceType} from '@warp-core/core/install/service/module-installation.interface';

export function AddInstallService(
	installService: ModuleInstallationInterfaceType,
): ClassDecorator {
	return <T>(target: T) => {
		InstallModule.installTokens.add({
			module: target as Type<T>,
			service: installService,
		});
	};
}
