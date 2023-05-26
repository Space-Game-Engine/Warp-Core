import { HabitatModel } from "@warp-core/database";

export class HabitatCreatedEvent {
    constructor(
        private habitat: HabitatModel
    ) { }

    getHabitat(): HabitatModel {
        return this.habitat;
    }
}