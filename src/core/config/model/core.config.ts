import {Type} from 'class-transformer';
import {ValidateNested} from 'class-validator';
import {JwtConfig} from './jwt.config';
import {DatabaseConfig} from '@warp-core/core/config/model/database.config';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';

export class CoreConfig {
	@Type(() => DatabaseConfig)
	@ValidateNested()
	database: DatabaseConfig;

	@Type(() => JwtConfig)
	@ValidateNested()
	jwt: JwtConfig;

	@Type(() => RuntimeConfig)
	@ValidateNested()
	runtime: RuntimeConfig;
}
