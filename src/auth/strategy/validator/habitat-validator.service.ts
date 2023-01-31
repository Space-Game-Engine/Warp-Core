import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HabitatModel } from "../../../habitat/model/habitat.model";
import { AuthModelInterface } from "../../interface/auth-model.interface";
import { ValidatorInterface } from "./validator.interface";

export class HabitatValidatorService implements ValidatorInterface {
    constructor(
        @InjectRepository(HabitatModel)
        private readonly habitatRepository: Repository<HabitatModel>
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