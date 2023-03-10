import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@warp-core/database/database.module';
import { BuildingModule } from '@warp-core/building/building.module';
import { HabitatModule } from '@warp-core/habitat/habitat.module';
import { BuildingZoneModule } from '@warp-core/building-zone/building-zone.module';
import { BuildingQueueModule } from '@warp-core/building-queue/building-queue.module';
import { AuthModule } from '@warp-core/auth/auth.module';
import config from '@warp-core/core/config/config-parser';

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
      ...BuildingQueueModule.entities(),
    ];
  }
}
