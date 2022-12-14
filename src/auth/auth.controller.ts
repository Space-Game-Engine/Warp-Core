import { Controller, Request, Post, UseGuards, Get, Param, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorator/public-path.decorator';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Public()
    @Get('create/:id')
    async createHabitat(
        @Param('id') id: number,
        @Res() res: Response
    ) {
        const newHabitat = await this.authService.createHabitatForNewUser(id);

        res.json({
            userId: id,
            habitatId: newHabitat.id
        });
    }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}