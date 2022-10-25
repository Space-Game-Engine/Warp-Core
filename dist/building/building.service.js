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
exports.BuildingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const apollo_server_express_1 = require("apollo-server-express");
const typeorm_2 = require("typeorm");
const building_model_1 = require("./model/building.model");
let BuildingService = class BuildingService {
    constructor(buildingRepository) {
        this.buildingRepository = buildingRepository;
    }
    getBuildingById(buildingId) {
        return this.buildingRepository.findOne({
            where: {
                id: buildingId
            },
            loadEagerRelations: true
        });
    }
    getAllBuildings() {
        return this.buildingRepository.find({
            loadEagerRelations: true
        });
    }
    async calculateTimeInSecondsToUpgradeBuilding(startLevel, endLevel, buildingId) {
        const building = await this.getBuildingById(buildingId);
        if (!building) {
            throw new apollo_server_express_1.UserInputError("Building does not exists");
        }
        let secondsToUpgrade = 0;
        if (startLevel === endLevel) {
            return secondsToUpgrade;
        }
        for (const buildingDetails of building.buildingDetailsAtCertainLevel) {
            if (buildingDetails.level <= startLevel) {
                continue;
            }
            if (buildingDetails.level > endLevel) {
                break;
            }
            secondsToUpgrade += buildingDetails.timeToUpdateBuildingInSeconds;
        }
        return secondsToUpgrade;
    }
};
BuildingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(building_model_1.BuildingModel)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BuildingService);
exports.BuildingService = BuildingService;
//# sourceMappingURL=building.service.js.map