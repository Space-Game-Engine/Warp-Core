import {Module} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';

@Module({
	providers: [
		{
			provide: RuntimeConfig,
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return configService.get<RuntimeConfig>('runtime');
			},
		},
	],
	exports: [RuntimeConfig],
})
export class CoreConfigModule {}
