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
import {BuildingModule} from '@warp-core/building';
import {BuildingQueueModule} from '@warp-core/building-queue';
import {BuildingZoneModule} from '@warp-core/building-zone/building-zone.module';
import config from '@warp-core/core/config/config-parser';
import {CoreConfigModule} from '@warp-core/core/config/core-config.module';
import {DatabaseConfig} from '@warp-core/core/config/model/database.config';
import {validate} from '@warp-core/core/config/validate';
import {parseValidationErrorMessageResponse} from '@warp-core/core/validation/parse-validation-error-message-response';
import {DatabaseModule} from '@warp-core/database';
import {ResourcesModule} from '@warp-core/resources';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true, // to get access to it in every component
			validate: validate,
			load: [config],
		}),
		ClsModule.forRoot({
			global: true,
			middleware: {mount: true, generateId: true},
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
		BuildingQueueModule,
		BuildingModule,
		// HabitatModule,
		BuildingZoneModule,
		ResourcesModule,
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
