import { Injectable } from '@nestjs/common';
import { HabitatService } from '../habitat/habitat.service';
import { HabitatModel } from '../habitat/model/habitat.model';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly habitatService: HabitatService,
        private jwtService: JwtService
    ) { }

    async validateUserHabitat(userId: number, habitatId: number): Promise<HabitatModel | null> {
        const habitats = await this.habitatService.getHabitatsByUserId(userId);

        if (habitats.length == 0) {
            return null;
        }

        const habitatToLogin = habitats.find(singleHabitat => singleHabitat.id === habitatId);

        if (!habitatToLogin) {
            return null;
        }

        return habitatToLogin;
    }

    async login(habitat: HabitatModel) {
        const payload = { habitatModel: habitat, sub: habitat.userId };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async createHabitatForNewUser(userId: number): Promise<HabitatModel> {
        const habitats = await this.habitatService.getHabitatsByUserId(userId);

        if (habitats.length > 0) {
            return habitats.find(Boolean);
        }

        return this.habitatService.createNewHabitat({
            userId: userId,
            isMain: true,
            name: "New habitat"
        });
    }
}