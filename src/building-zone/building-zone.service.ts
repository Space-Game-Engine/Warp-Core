import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { PayloadDataService } from "@warp-core/auth/payload-data.service";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { BuildingZoneRepository } from "@warp-core/database/repository/building-zone.repository";
import { HabitatCreatedEvent } from "@warp-core/habitat/event/habitat-created.event";

@Injectable()
export class BuildingZoneService {
    constructor(
        private readonly buildingZoneRepository: BuildingZoneRepository,
        private readonly payloadDataService: PayloadDataService,
        private readonly configService: ConfigService,
    ) {}

    async getAllZonesForCurrentHabitat(): Promise<BuildingZoneModel[]> {
        const habitat = await this.payloadDataService.getModel();

        return this.buildingZoneRepository.getAllBuildingZonesByHabitatId(habitat.getAuthId());
    }

    async getSingleBuildingZone(counterPerHabitat: number): Promise<BuildingZoneModel| null> {
        const habitat = await this.payloadDataService.getModel();

        return this.buildingZoneRepository.getSingleBuildingZone(counterPerHabitat, habitat.getAuthId());
    }

    async createNewBuildingZone(habitat: HabitatModel): Promise<BuildingZoneModel> {
        const maxCounterPerHabitat = await this.buildingZoneRepository.getMaxOfCounterPerHabitat(habitat.id);
        
        const newBuildingZone = await this.buildingZoneRepository.save({
            counterPerHabitat: maxCounterPerHabitat + 1,
            habitat: habitat,
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