import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HabitatModule } from '../habitat/habitat.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GqlAuthGuard } from './guard/gql-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';

const jwtFactory = {
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get('jwt.secret'),
    signOptions: {
      expiresIn: configService.get('jwt.expiresIn'),
    },
  }),
  inject: [ConfigService],
};

@Module({
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
  ],
  imports: [
    HabitatModule,
    PassportModule,
    JwtModule.registerAsync(jwtFactory),
    ConfigModule,
  ],
  controllers: [
    AuthController
  ],
})
export class AuthModule {}
