import { HabitatModel } from "@warp-core/database/model/habitat.model";

export class HabitatCreatedEvent {
    constructor(
        public readonly habitat: HabitatModel
    ) { }
}