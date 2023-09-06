import {IsBoolean, IsString} from 'class-validator';
import {DatabaseType} from 'typeorm';
import {DatabaseModule} from '@warp-core/database';

export class DatabaseConfig {
	@IsString()
	type: DatabaseType;

	@IsString()
	host?: string;

	@IsString()
	port?: string;

	@IsString()
	username?: string;

	@IsString()
	password?: string;

	@IsString()
	database: string;

	@IsBoolean()
	synchronize: boolean;

	get entities() {
		return DatabaseModule.entities();
	}
}
