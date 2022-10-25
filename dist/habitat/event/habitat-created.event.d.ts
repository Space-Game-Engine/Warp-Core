import { HabitatModel } from "../model/habitat.model";
export declare class HabitatCreatedEvent {
    private habitat;
    constructor(habitat: HabitatModel);
    getHabitat(): HabitatModel;
}
