import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ValidatorInterface } from './validator/validator.interface';
import { AuthModelInterface } from '../interface/auth-model.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject('VALIDATOR_SERVICE') private readonly validatorService: ValidatorInterface,
    ) {
        super({
            usernameField: "userId",
            passwordField: "habitatId"
        });
    }

    async validate(userId: number, habitatId: number): Promise<AuthModelInterface> {
        const authModel = await this.validatorService.validate(userId, habitatId);

        if (authModel === null) {
            throw new UnauthorizedException();
        }

        return authModel;
    }
}