import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {APP_GUARD} from '@nestjs/core';
import {JwtModule} from '@nestjs/jwt';
import {JwtModuleOptions} from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';
import {PassportModule} from '@nestjs/passport';
import {Request} from 'express';
import {CLS_REQ, ClsModule} from 'nestjs-cls';

import {AuthController} from '@warp-core/auth/auth.controller';
import {GqlAuthGuard} from '@warp-core/auth/guard/gql-auth.guard';
import {JwtService} from '@warp-core/auth/jwt.service';
import {LoginByHabitatService} from '@warp-core/auth/login/login-by-habitat.service';
import {AuthorizedHabitatModel} from '@warp-core/auth/payload/model/habitat.model';
import {RegisterService} from '@warp-core/auth/register/register.service';
import {JwtStrategy} from '@warp-core/auth/strategy/jwt.strategy';
import {LocalStrategy} from '@warp-core/auth/strategy/local.strategy';
import {HabitatValidatorService} from '@warp-core/auth/strategy/validator/habitat-validator.service';
import {DatabaseModule} from '@warp-core/database/database.module';
import {HabitatRepository} from '@warp-core/database/repository/habitat.repository';
import {HabitatEmitter} from '@warp-core/user/habitat';

const jwtFactory = {
	useFactory: async (
		configService: ConfigService,
	): Promise<JwtModuleOptions> => ({
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
			useClass: HabitatValidatorService,
		},
		{
			provide: 'LOGIN_SERVICE',
			useClass: LoginByHabitatService,
		},
		{
			provide: 'REGISTER_SERVICE',
			useClass: RegisterService,
		},
		LocalStrategy,
		JwtStrategy,
		JwtService,
		{
			provide: APP_GUARD,
			useClass: GqlAuthGuard,
		},
		HabitatEmitter,
	],
	imports: [
		PassportModule,
		JwtModule.registerAsync(jwtFactory),
		ConfigModule,
		DatabaseModule,
		ClsModule.forFeatureAsync({
			global: true,
			provide: AuthorizedHabitatModel,
			imports: [DatabaseModule, AuthModule],
			inject: [CLS_REQ, HabitatRepository, JwtService],
			useFactory: async (
				req: Request,
				habitatRepository: HabitatRepository,
				jwtService: JwtService,
			) => {
				const payload = jwtService.decode(req);

				if (!payload) {
					return null;
				}

				const habitat = await habitatRepository.getHabitatById(
					payload.currentHabitatId,
				);
				return habitat;
			},
		}),
	],
	controllers: [AuthController],
	exports: [ClsModule, JwtService],
})
export class AuthModule {}
