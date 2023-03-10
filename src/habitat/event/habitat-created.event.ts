import { HabitatModel } from "@warp-core/database/model/habitat.model";

export class HabitatCreatedEvent {
    constructor(
        private habitat: HabitatModel
    ) { }

    getHabitat(): HabitatModel {
        return this.habitat;
    }
}