"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildingZoneService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const habitat_created_event_1 = require("../habitat/event/habitat-created.event");
const building_zone_model_1 = require("./model/building-zone.model");
let BuildingZoneService = class BuildingZoneService {
    constructor(buildingZoneRepository, configService) {
        this.buildingZoneRepository = buildingZoneRepository;
        this.configService = configService;
    }
    async getAllBuildingZonesByHabitatId(habitatId) {
        const buildingZones = await this.buildingZoneRepository.find({
            where: {
                habitat: {
                    id: habitatId
                }
            }
        });
        return buildingZones;
    }
    async getSingleBuildingZone(counterPerHabitat, habitatId) {
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
    async getSingleBuildingZoneById(buildingZoneId) {
        const singleBuildingZone = await this.buildingZoneRepository.findOne({
            where: {
                id: buildingZoneId
            }
        });
        return singleBuildingZone;
    }
    async getMaxOfCounterPerHabitat(habitatId) {
        const allBuildingZones = await this.getAllBuildingZonesByHabitatId(habitatId);
        let maxCounterValue = 0;
        for (const singleBuildingZone of allBuildingZones) {
            if (singleBuildingZone.counterPerHabitat > maxCounterValue) {
                maxCounterValue = singleBuildingZone.counterPerHabitat;
            }
        }
        return maxCounterValue;
    }
    async createNewBuildingZone(habitat) {
        const maxCounterPerHabitat = await this.getMaxOfCounterPerHabitat(habitat.id);
        const newBuildingZone = await this.buildingZoneRepository.save({
            counterPerHabitat: maxCounterPerHabitat + 1,
            habitat: habitat,
            level: 0,
            placement: ''
        });
        return newBuildingZone;
    }
    async createBuildingZoneOnNewHabitatCreation(payload) {
        const counterForNewHabitat = this.configService.get('habitat.buildingZones.counterForNewHabitat');
        for (let buildingZoneCounter = 0; buildingZoneCounter < counterForNewHabitat; buildingZoneCounter++) {
            await this.createNewBuildingZone(payload.getHabitat());
        }
    }
};
__decorate([
    (0, event_emitter_1.OnEvent)('habitat.create_new'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [habitat_created_event_1.HabitatCreatedEvent]),
    __metadata("design:returntype", Promise)
], BuildingZoneService.prototype, "createBuildingZoneOnNewHabitatCreation", null);
BuildingZoneService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(building_zone_model_1.BuildingZoneModel)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], BuildingZoneService);
exports.BuildingZoneService = BuildingZoneService;
//# sourceMappingURL=building-zone.service.js.map