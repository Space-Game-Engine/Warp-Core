import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {APP_GUARD} from '@nestjs/core';
import {JwtModule, JwtService} from '@nestjs/jwt';
import {JwtModuleOptions} from '@nestjs/jwt/dist/interfaces/jwt-module-options.interface';
import {PassportModule} from '@nestjs/passport';
import {Request} from 'express';
import {CLS_REQ, ClsModule} from 'nestjs-cls';
import {ExtractJwt} from 'passport-jwt';

import {AuthController} from '@warp-core/auth/auth.controller';
import {GqlAuthGuard} from '@warp-core/auth/guard/gql-auth.guard';
import {PayloadInterface} from '@warp-core/auth/interface/payload.interface';
import {LoginByHabitatService} from '@warp-core/auth/login/login-by-habitat.service';
import {AuthorizedHabitatModel} from '@warp-core/auth/payload/model/habitat.model';
import {RegisterService} from '@warp-core/auth/register/register.service';
import {JwtStrategy} from '@warp-core/auth/strategy/jwt.strategy';
import {LocalStrategy} from '@warp-core/auth/strategy/local.strategy';
import {HabitatValidatorService} from '@warp-core/auth/strategy/validator/habitat-validator.service';
import {DatabaseModule} from '@warp-core/database/database.module';
import {HabitatRepository} from '@warp-core/database/repository/habitat.repository';

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
		{
			provide: APP_GUARD,
			useClass: GqlAuthGuard,
		},
	],
	imports: [
		PassportModule,
		JwtModule.registerAsync(jwtFactory),
		ConfigModule,
		DatabaseModule,
		ClsModule.forFeatureAsync({
			provide: AuthorizedHabitatModel,
			imports: [DatabaseModule, JwtModule],
			inject: [CLS_REQ, HabitatRepository, JwtService],
			useFactory: async (
				req: Request,
				habitatRepository: HabitatRepository,
				jwtService: JwtService,
			) => {
				const extractJwt = ExtractJwt.fromAuthHeaderAsBearerToken();
				const payload = jwtService.decode(
					extractJwt(req) ?? '',
				) as PayloadInterface;

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
	exports: [ClsModule],
})
export class AuthModule {}
