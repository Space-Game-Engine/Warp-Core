import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@warp-core/database';
import { BuildingModule } from '@warp-core/building';
import { HabitatModule } from '@warp-core/habitat';
import { BuildingZoneModule } from '@warp-core/building-zone';
import { BuildingQueueModule } from '@warp-core/building-queue';
import { AuthModule } from '@warp-core/auth';
import config from '@warp-core/core/config/config-parser';
import { validate } from '@warp-core/core/config/validate';
import { DatabaseConfig } from '@warp-core/core/config/model/database.config';
import { ResourcesModule } from '@warp-core/resources';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // to get access to it in every component
            validate: validate,
            load: [config],
        }),
        EventEmitterModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const databaseConfiguration = configService.get<DatabaseConfig>('database');

                databaseConfiguration.entities = AppModule.entities();

                return databaseConfiguration as TypeOrmModuleOptions;
            }
        }),
        DatabaseModule,
        BuildingModule,
        HabitatModule,
        BuildingZoneModule,
        BuildingQueueModule,
        ResourcesModule,
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        }),
        AuthModule,
    ],
})
export class AppModule {

    static entities() {
        return [
            ...DatabaseModule.entities(),
        ];
    }
}
