import {Type} from 'class-transformer';
import {ValidateNested} from 'class-validator';

import {JwtConfig} from './jwt.config';

import {DatabaseConfig} from '@warp-core/core/config/model/database.config';
import {SecurityConfig} from '@warp-core/core/config/model/security.config';
import {RuntimeConfig} from '@warp-core/core/config/runtime.config';

export class CoreConfig {
	@Type(() => DatabaseConfig)
	@ValidateNested()
	public database: DatabaseConfig;

	@Type(() => JwtConfig)
	@ValidateNested()
	public jwt: JwtConfig;

	@Type(() => SecurityConfig)
	@ValidateNested()
	public security: SecurityConfig;

	@Type(() => RuntimeConfig)
	@ValidateNested()
	public runtime: RuntimeConfig;
}
