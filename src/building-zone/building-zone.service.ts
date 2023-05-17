import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { AuthorizedHabitatModel } from "@warp-core/auth/payload/model/habitat.model";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { BuildingZoneRepository } from "@warp-core/database/repository/building-zone.repository";
import { HabitatCreatedEvent } from "@warp-core/habitat/event/habitat-created.event";

@Injectable()
export class BuildingZoneService {
    constructor(
        private readonly buildingZoneRepository: BuildingZoneRepository,
        private readonly habitatModel: AuthorizedHabitatModel,
        private readonly configService: ConfigService,
    ) {}

    async getAllZonesForCurrentHabitat(): Promise<BuildingZoneModel[]> {
        return this.habitatModel.buildingZones;
    }

    async getSingleBuildingZone(localBuildingZoneId: number): Promise<BuildingZoneModel| null> {
        return (await this.habitatModel.buildingZones)
            .find(buildingZone => buildingZone.localBuildingZoneId === localBuildingZoneId) || null;
    }

    async createNewBuildingZone(habitat: HabitatModel): Promise<BuildingZoneModel> {
        const maxCounterPerHabitat = await this.buildingZoneRepository.getMaxOfCounterPerHabitat(habitat.id);
        
        const newBuildingZone = await this.buildingZoneRepository.save({
            localBuildingZoneId: maxCounterPerHabitat + 1,
            habitatId: habitat.id,
            level: 0,
            placement: ''
        });

        return newBuildingZone;
    }

    @OnEvent('habitat.create_new')
    async createBuildingZoneOnNewHabitatCreation(payload: HabitatCreatedEvent) {
        const counterForNewHabitat = this.configService.get<number>('habitat.buildingZones.counterForNewHabitat');
        for (let buildingZoneCounter = 0; buildingZoneCounter < counterForNewHabitat; buildingZoneCounter++) {
            await this.createNewBuildingZone(payload.getHabitat());
        }
    }
}