import { Injectable } from "@nestjs/common";
import { AuthorizedHabitatModel } from "@warp-core/auth/payload/model/habitat.model";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { HabitatRepository } from "@warp-core/database/repository/habitat.repository";

@Injectable()
export class HabitatService {
    constructor(
        private readonly habitatRepository: HabitatRepository,
        private readonly habitatModel: AuthorizedHabitatModel,
    ) {
    }

    async getCurrentHabitat(): Promise<HabitatModel> {
        return this.habitatModel;
    }

    async getHabitatsForLoggedIn(): Promise<HabitatModel[]> {
        return this.habitatRepository.getHabitatsByUserId(this.habitatModel.userId);
    }

    async getHabitatById(habitatId: number): Promise<HabitatModel | null > {
        return this.habitatRepository.getHabitatById(habitatId);
    }
}
