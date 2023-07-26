import {Injectable} from "@nestjs/common";
import {OnEvent} from "@nestjs/event-emitter";
import {HabitatCreatedEvent} from "@warp-core/habitat";
import {RuntimeConfig} from "@warp-core/core/config/runtime.config";
import {BuildingZoneService} from "@warp-core/building-zone/building-zone.service";
import {BuildingRepository, BuildingZoneModel, BuildingZoneRepository} from "@warp-core/database";

@Injectable()
export class FirstHabitatCreatedSubscriber {
    constructor(
        private readonly runtimeConfig: RuntimeConfig,
        private readonly buildingZoneService: BuildingZoneService,
        private readonly buildingZoneRepository: BuildingZoneRepository,
        private readonly buildingRepository: BuildingRepository,
    ) {}

    @OnEvent('habitat.created.after_registration')
    async addBuildingsOnFirstHabitatCreation(payload: HabitatCreatedEvent, transactionId: string) {
        if (!this.runtimeConfig.habitat.onStart.buildings || this.runtimeConfig.habitat.onStart.buildings.length === 0) {
            return;
        }

        const habitat = payload.habitat;
        const buildingsToBuildFromConfiguration = this.runtimeConfig.habitat.onStart.buildings;
        const buildingsToBuild = await this.buildingRepository.getBuildingsByIds(
            buildingsToBuildFromConfiguration.map((singleBuildingFromConfig) => singleBuildingFromConfig.id)
        );

        const entityManager = this.buildingZoneRepository.getSharedTransaction(transactionId);

        for (const habitatBuildingsConfig of buildingsToBuildFromConfiguration) {
            const buildingZone = await this.buildingZoneService.getSingleBuildingZone(
                habitatBuildingsConfig.localBuildingZoneId,
                habitat
            );

            buildingZone.buildingId = buildingsToBuild.find(
                (singleBuilding) => singleBuilding.id === habitatBuildingsConfig.id
            ).id;

            buildingZone.level = habitatBuildingsConfig.level;

            await entityManager.update(
                BuildingZoneModel,
                buildingZone.id,
                {
                    buildingId: buildingZone.buildingId,
                    level: buildingZone.level
                }
            );
        }
    }
}