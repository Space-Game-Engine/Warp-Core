import { Controller, Request, Post, UseGuards, Get, Param, Res, Inject, ParseIntPipe } from '@nestjs/common';
import { Public } from './decorator/public-path.decorator';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Response } from 'express';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiQuery, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LoginParameters } from './login/login-parameters.model';
import { AccessToken } from './login/access-token.model';
import { LoginInterface } from './login/login.interface';
import { RegisterInterface } from './register/register.interface';

@Controller('auth')
export class AuthController {
    constructor(
        @Inject('LOGIN_SERVICE') private readonly loginService: LoginInterface,
        @Inject('REGISTER_SERVICE') private readonly registerService: RegisterInterface,
    ) { }

    @Public()
    @Get('create/:id')
    @ApiQuery({
        name: 'id',
        type: 'number',
        description: 'Unique per game server user id that make it possible to authenticate'
    })
    @ApiOkResponse({
        description: 'New habitat for provided user was created. You can reuse response in login request to fetch jwt token',
        type: LoginParameters
    })
    async createHabitat(
        @Param('id', new ParseIntPipe()) id: number,
        @Res() res: Response
    ) {
        const loginParameters = await this.registerService.registerUser(id);

        res.json(loginParameters);
    }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiBody({
        type: LoginParameters
    })
    @ApiCreatedResponse({
        description: 'Use JWT token from response as bearer token during GraphQL requests',
        type: AccessToken
    })
    @ApiUnauthorizedResponse({
        description: 'Provided credentials are wrong, check again your UserId and HabitatId. Maybe try to create new habitat first?'
    })
    async login(@Request() req) {
        return this.loginService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}