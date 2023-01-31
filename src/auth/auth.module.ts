import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitatModel } from '../habitat/model/habitat.model';
import { AuthController } from './auth.controller';
import { GqlAuthGuard } from './guard/gql-auth.guard';
import { LoginByHabitatService } from './login/login-by-habitat.service';
import { PayloadDataService } from './payload-data.service';
import { RegisterService } from './register/regiser.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { HabitatValidatorService } from './strategy/validator/habitat-validator.service';

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
    {
      provide: 'VALIDATOR_SERVICE',
      useClass: HabitatValidatorService
    },
    {
      provide: 'LOGIN_SERVICE',
      useClass: LoginByHabitatService
    },
    {
      provide: 'REGISTER_SERVICE',
      useClass: RegisterService
    },
    LocalStrategy,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: GqlAuthGuard,
    },
    PayloadDataService,
  ],
  imports: [
    PassportModule,
    JwtModule.registerAsync(jwtFactory),
    ConfigModule,
    TypeOrmModule.forFeature([HabitatModel]),
  ],
  controllers: [
    AuthController
  ],
  exports: [
    PayloadDataService,
  ]
})
export class AuthModule {}
