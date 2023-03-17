import { Injectable } from "@nestjs/common";
import { AuthModelInterface } from "@warp-core/auth/interface/auth-model.interface";
import { HabitatRepository } from "@warp-core/database/repository/habitat.repository";
import { ValidatorInterface } from "./validator.interface";

@Injectable()
export class HabitatValidatorService implements ValidatorInterface {
    constructor(
        private readonly habitatRepository: HabitatRepository
    ) {
    }

    async validate(userId: number, habitatId: number): Promise<AuthModelInterface | null> {
        const habitatModel = await this.habitatRepository.findOne({
            where: {
                id: habitatId,
                userId: userId
            }
        });

        return habitatModel;
    }
}