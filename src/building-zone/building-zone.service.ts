import {Injectable} from "@nestjs/common";
import {AuthorizedHabitatModel} from "@warp-core/auth";
import {BuildingZoneModel, BuildingZoneRepository, HabitatModel} from "@warp-core/database";

@Injectable()
export class BuildingZoneService {
    constructor(
        private readonly buildingZoneRepository: BuildingZoneRepository,
        private readonly habitatModel: AuthorizedHabitatModel,
    ) {
    }

    async getAllZonesForCurrentHabitat(): Promise<BuildingZoneModel[]> {
        return this.habitatModel.buildingZones;
    }

    async getSingleBuildingZone(localBuildingZoneId: number, habitatModel: HabitatModel = this.habitatModel): Promise<BuildingZoneModel | null> {
        return (await habitatModel.buildingZones)
            .find(buildingZone => buildingZone.localBuildingZoneId === localBuildingZoneId) || null;
    }

    async createNewBuildingZone(habitat: HabitatModel, transactionId: string | null = null): Promise<BuildingZoneModel> {
        const maxCounterPerHabitat = await this.buildingZoneRepository.getMaxOfCounterPerHabitat(habitat.id);

        let entityManager = this.buildingZoneRepository.manager;

        if (transactionId) {
            entityManager = this.buildingZoneRepository.getSharedTransaction(transactionId);
        }

        const newBuildingZone = await entityManager.save(
            BuildingZoneModel,
            {
                localBuildingZoneId: maxCounterPerHabitat + 1,
                habitatId: habitat.id,
                level: 0,
                placement: ''
            });

        return newBuildingZone;
    }
}