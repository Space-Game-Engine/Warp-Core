import {Module} from '@nestjs/common';
import {ClsModule} from 'nestjs-cls';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';
import {DatabaseConfig} from '@warp-core/core/config/model/database.config';
import {TypeOrmModuleOptions} from '@nestjs/typeorm';

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
