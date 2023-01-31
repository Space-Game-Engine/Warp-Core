import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayloadInterface } from '../interface/payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: configService.get('jwt.ignoreExpiration'),
            secretOrKey: configService.get('jwt.secret'),
        });
    }

    async validate(payload: PayloadInterface) {
        return payload.dbModel;
    }
}