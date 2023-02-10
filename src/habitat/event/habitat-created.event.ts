import { HabitatModel } from "../../database/model/habitat.model";

export class HabitatCreatedEvent {
    constructor(
        private habitat: HabitatModel
    ) { }

    getHabitat(): HabitatModel {
        return this.habitat;
    }
}