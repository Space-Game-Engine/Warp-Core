import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HabitatCreatedEvent } from "../habitat/event/habitat-created.event";
import { HabitatModel } from "../habitat/model/habitat.model";
import { BuildingZoneModel } from "./model/building-zone.model";

@Injectable()
export class BuildingZoneService {
    constructor(
        @InjectRepository(BuildingZoneModel)
        private readonly buildingZoneRepository: Repository<BuildingZoneModel>,
        private readonly configService: ConfigService,
    ) {}

    async getAllBuildingZonesByHabitatId(habitatId: number) {
        const buildingZones = await this.buildingZoneRepository.find({
            where: {
                habitat : {
                    id: habitatId
                }
            }
        });

        return buildingZones;
    }

    async getSingleBuildingZone(counterPerHabitat: number, habitatId: number): Promise<BuildingZoneModel | null> {
        const singleBuildingZone = await this.buildingZoneRepository.findOne({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitat: {
                    id: habitatId
                }
            }
        });

        return singleBuildingZone;
    }

    async getSingleBuildingZoneById(buildingZoneId: number): Promise<BuildingZoneModel | null> {
        const singleBuildingZone = await this.buildingZoneRepository.findOne({
            where: {
                id: buildingZoneId
            }
        });

        return singleBuildingZone;
    }

    private async getMaxOfCounterPerHabitat(habitatId: number): Promise<number> {
        const allBuildingZones = await this.getAllBuildingZonesByHabitatId(habitatId);
        let maxCounterValue = 0;

        for (const singleBuildingZone of allBuildingZones) {
            if (singleBuildingZone.counterPerHabitat > maxCounterValue) {
                maxCounterValue = singleBuildingZone.counterPerHabitat;
            }
        }

        return maxCounterValue;
    }

    async createNewBuildingZone(habitat: HabitatModel): Promise<BuildingZoneModel> {
        const maxCounterPerHabitat = await this.getMaxOfCounterPerHabitat(habitat.id);
        
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