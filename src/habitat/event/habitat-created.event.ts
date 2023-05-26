import { HabitatModel } from "@warp-core/database";

export class HabitatCreatedEvent {
    constructor(
        public readonly habitat: HabitatModel
    ) { }
}