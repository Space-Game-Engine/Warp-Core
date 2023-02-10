import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { BuildingModule } from './building/building.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitatModule } from './habitat/habitat.module';
import { BuildingZoneModule } from './building-zone/building-zone.module';
import { ConfigModule } from '@nestjs/config';
import config from './core/config/config-parser';
import { BuildingQueueModule } from './building-queue/building-queue.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'mydb.db',
      entities: AppModule.entities(),
      synchronize: true,
    }),
    DatabaseModule,
    BuildingModule,
    HabitatModule,
    BuildingZoneModule,
    BuildingQueueModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    ConfigModule.forRoot({
      isGlobal: true, // to get access to it in every component
      load: [config],
    }),
    AuthModule,
  ],
})
export class AppModule {

  static entities() {
    return [
      ...DatabaseModule.entities(),
      ...BuildingZoneModule.entities(),
      ...BuildingQueueModule.entities(),
    ];
  }
}
