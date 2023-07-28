import {Type} from '@nestjs/common';
import {IsBoolean, IsString} from 'class-validator';
import {DatabaseType} from 'typeorm';

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

	entities: Type[];
}
