import {plainToInstance} from 'class-transformer';

import {CoreConfig} from '@warp-core/core/config/model/core.config';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';

export const coreConfigMock = {
	provide: RuntimeConfig,
	useFactory: (): RuntimeConfig => {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const config = require('config');
		return plainToInstance(CoreConfig, config).runtime;
	},
};
