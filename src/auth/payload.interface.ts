import { HabitatModel } from "../habitat/model/habitat.model";

export interface PayloadInterface {
    sub: number;
    habitatModel: HabitatModel;
}