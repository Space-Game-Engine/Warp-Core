import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { AuthorizedHabitatModel } from "@warp-core/auth";
import { BuildingZoneModel, BuildingZoneRepository, HabitatModel } from "@warp-core/database";
import { HabitatCreatedEvent } from "@warp-core/habitat";

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