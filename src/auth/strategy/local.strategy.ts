import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { HabitatModel } from '../../habitat/model/habitat.model';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: "userId",
            passwordField: "habitatId"
        });
    }

    async validate(userId: number, habitatId: number): Promise<HabitatModel> {
        const habitat = await this.authService.validateUserHabitat(userId, habitatId);
        if (habitat === null) {
            throw new UnauthorizedException();
        }
        return habitat;
    }
}