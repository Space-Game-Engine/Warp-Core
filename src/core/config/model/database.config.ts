import {IsBoolean, IsString} from 'class-validator';
import {DatabaseType} from 'typeorm';

import {DatabaseModule} from '@warp-core/database/database.module';

export class DatabaseConfig {
	@IsString()
	public type: DatabaseType;

	@IsString()
	public host?: string;

	@IsString()
	public port?: string;

	@IsString()
	public username?: string;

	@IsString()
	public password?: string;

	@IsString()
	public database: string;

	@IsBoolean()
	public synchronize: boolean;

	public get entities(): object[] {
		return DatabaseModule.entities();
	}
}
