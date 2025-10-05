import {Provider} from '@nestjs/common';
import {InjectionToken} from '@nestjs/common/interfaces/modules/injection-token.interface';
import {ConfigService} from '@nestjs/config';

import {RegisterError} from '@warp-core/core/utils/mechanics/error';
import {MechanicsMetadataRegistry} from '@warp-core/core/utils/mechanics/mechanics-metadata-registry';
import {ADD_MECHANIC_CONFIG_ALIAS_KEY} from '@warp-core/core/utils/mechanics/mechanics.constants';

export class RegisterMechanic {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	public static forFeature<T extends Function>(
		groupToken: InjectionToken,
		configKey: string,
	): Provider {
		const filteredMechanics = MechanicsMetadataRegistry.findByGroup(groupToken);
		return {
			provide: groupToken,
			inject: [ConfigService, ...filteredMechanics.map(m => m.mechanicClass)],
			useFactory: (configService: ConfigService, ...mechanics: T[]): T => {
				const configuredName = configService.get<string>(configKey);

				if (!configuredName) {
					throw new RegisterError(
						`There is no mechanic configuration defined by "${configKey}" config key`,
					);
				}

				const mechanic = mechanics.find(
					m =>
						Reflect.getMetadata(
							ADD_MECHANIC_CONFIG_ALIAS_KEY,
							m.constructor,
						) === configuredName,
				);

				if (!mechanic) {
					throw new RegisterError(`No mechanic found for "${configuredName}"`);
				}
				return mechanic;
			},
		};
	}
}
