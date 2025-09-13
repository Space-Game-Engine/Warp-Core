import {join} from 'path';

import {ApolloDriver, ApolloDriverConfig} from '@nestjs/apollo';
import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {GraphQLModule} from '@nestjs/graphql';
import {TypeOrmModule, TypeOrmModuleOptions} from '@nestjs/typeorm';
import {EntityClassOrSchema} from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import {ClsModule} from 'nestjs-cls';

import {AuthModule} from '@warp-core/auth';
import config from '@warp-core/core/config/config-parser';
import {CoreConfigModule} from '@warp-core/core/config/core-config.module';
import {DatabaseConfig} from '@warp-core/core/config/model/database.config';
import {validate} from '@warp-core/core/config/validate';
import {InternalExchangeModule} from '@warp-core/core/utils/internal-exchange/internal-exchange.module';
import {parseValidationErrorMessageResponse} from '@warp-core/core/validation/parse-validation-error-message-response';
import {DatabaseModule} from '@warp-core/database/database.module';
import {GlobalModule} from '@warp-core/global/global.module';
import {UserModule} from '@warp-core/user/user.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true, // to get access to it in every component
			validate: validate,
			load: [config],
		}),
		InternalExchangeModule,
		ClsModule.forRoot({
			global: true,
			middleware: {mount: true, generateId: true, saveReq: true},
		}),
		EventEmitterModule.forRoot({
			wildcard: true,
			delimiter: '.',
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const databaseConfiguration =
					configService.get<DatabaseConfig>('database');

				return databaseConfiguration as TypeOrmModuleOptions;
			},
		}),
		CoreConfigModule,
		DatabaseModule,
		GlobalModule,
		UserModule,
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
			formatError: parseValidationErrorMessageResponse,
		}),
		AuthModule,
	],
})
export class AppModule {
	public static entities(): EntityClassOrSchema[] {
		return [...DatabaseModule.entities()];
	}
}
