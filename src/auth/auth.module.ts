import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '@warp-core/auth/auth.controller';
import { GqlAuthGuard } from '@warp-core/auth/guard/gql-auth.guard';
import { LoginByHabitatService } from '@warp-core/auth/login/login-by-habitat.service';
import { HabitatPayloadDataService } from '@warp-core/auth/payload/habitat-payload-data.service';
import { PayloadDataService } from '@warp-core/auth/payload/payload-data.service';
import { RegisterService } from '@warp-core/auth/register/regiser.service';
import { JwtStrategy } from '@warp-core/auth/strategy/jwt.strategy';
import { LocalStrategy } from '@warp-core/auth/strategy/local.strategy';
import { HabitatValidatorService } from '@warp-core/auth/strategy/validator/habitat-validator.service';
import { DatabaseModule } from '@warp-core/database/database.module';

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
    {
      provide: PayloadDataService,
      useClass: HabitatPayloadDataService
    },
  ],
  imports: [
    PassportModule,
    JwtModule.registerAsync(jwtFactory),
    ConfigModule,
    DatabaseModule,
  ],
  controllers: [
    AuthController
  ],
  exports: [
    PayloadDataService,
  ]
})
export class AuthModule {}
