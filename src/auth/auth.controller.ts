import {
	Controller,
	Request,
	Post,
	UseGuards,
	Get,
	Param,
	Res,
	Inject,
	ParseIntPipe,
} from '@nestjs/common';
import {
	ApiBody,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiQuery,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {Response} from 'express';

import {Public} from '@warp-core/auth/decorator/public-path.decorator';
import {JwtAuthGuard} from '@warp-core/auth/guard/jwt-auth.guard';
import {LocalAuthGuard} from '@warp-core/auth/guard/local-auth.guard';
import {AuthModelInterface} from '@warp-core/auth/interface/auth-model.interface';
import {AccessToken} from '@warp-core/auth/login/access-token.model';
import {LoginParameters} from '@warp-core/auth/login/login-parameters.model';
import {LoginInterface} from '@warp-core/auth/login/login.interface';
import {RegisterInterface} from '@warp-core/auth/register/register.interface';

@Controller('auth')
export class AuthController {
	constructor(
		@Inject('LOGIN_SERVICE') private readonly loginService: LoginInterface,
		@Inject('REGISTER_SERVICE')
		private readonly registerService: RegisterInterface,
	) {}

	@Public()
	@Get('create/:id')
	@ApiQuery({
		name: 'id',
		type: 'number',
		description:
			'Unique per game server user id that make it possible to authenticate',
	})
	@ApiOkResponse({
		description:
			'New habitat for provided user was created. You can reuse response in login request to fetch jwt token',
		type: LoginParameters,
	})
	public async createHabitat(
		@Param('id', new ParseIntPipe()) id: number,
		@Res() res: Response,
	): Promise<void> {
		const loginParameters = await this.registerService.registerUser(id);

		res.json(loginParameters);
	}

	@Public()
	@UseGuards(LocalAuthGuard)
	@Post('login')
	@ApiBody({
		type: LoginParameters,
	})
	@ApiCreatedResponse({
		description:
			'Use JWT token from response as bearer token during GraphQL requests',
		type: AccessToken,
	})
	@ApiUnauthorizedResponse({
		description:
			'Provided credentials are wrong, check again your UserId and HabitatId. Maybe try to create new habitat first?',
	})
	public login(
		@Request() req: {user: AuthModelInterface},
	): Promise<AccessToken> {
		return this.loginService.login(req.user);
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	public getProfile(@Request() req): AuthModelInterface {
		return req.user;
	}
}
