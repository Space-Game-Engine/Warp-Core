import { AuthModelInterface } from "@warp-core/auth/interface/auth-model.interface";
import { PayloadDataService } from "@warp-core/auth/payload/payload-data.service";
import { HabitatModel } from "@warp-core/database/model/habitat.model";

export class HabitatPayloadDataService extends PayloadDataService {
    parseDbModel(dbModel: any): AuthModelInterface {
        const habitatModel = new HabitatModel();
        habitatModel.id = dbModel.id;
        habitatModel.isMain = dbModel.isMain;
        habitatModel.name = dbModel.name;
        habitatModel.userId = dbModel.userId;

        return habitatModel;
    }

}