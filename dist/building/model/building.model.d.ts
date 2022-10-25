import { BuildingDetailsAtCertainLevelModel } from "./building-details-at-certain-level.model";
import { Role } from "./role.enum";
export declare class BuildingModel {
    id: number;
    role: Role;
    name: string;
    buildingDetailsAtCertainLevel: BuildingDetailsAtCertainLevelModel[];
}
