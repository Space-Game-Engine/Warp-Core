import {InjectionToken} from '@nestjs/common/interfaces/modules/injection-token.interface';

import {MechanicsMetadataRegistry} from '@warp-core/core/utils/mechanics/mechanics-metadata-registry';
import {
	ADD_MECHANIC_CONFIG_ALIAS_KEY,
	ADD_MECHANIC_CONFIG_GROUP,
} from '@warp-core/core/utils/mechanics/mechanics.constants';

export function AddMechanic(
	group: InjectionToken,
	alias: string,
): ClassDecorator {
	return target => {
		MechanicsMetadataRegistry.add({group, alias, mechanicClass: target});

		Reflect.defineMetadata(ADD_MECHANIC_CONFIG_ALIAS_KEY, alias, target);
		Reflect.defineMetadata(ADD_MECHANIC_CONFIG_GROUP, group, target);
	};
}
