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
exports.BuildingQueueFetchService = void 0;
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const building_queue_element_model_1 = require("./model/building-queue-element.model");
let BuildingQueueFetchService = class BuildingQueueFetchService {
    constructor(buildingQueueRepository) {
        this.buildingQueueRepository = buildingQueueRepository;
    }
    getCurrentBuildingQueueForHabitat(habitatId) {
        return this.buildingQueueRepository.find({
            where: {
                buildingZone: {
                    habitatId: habitatId
                },
                endTime: (0, typeorm_2.MoreThanOrEqual)(new Date()),
            }
        });
    }
    getCurrentBuildingQueueForBuildingZone(buildingZone) {
        return this.buildingQueueRepository.find({
            where: {
                buildingZone: buildingZone,
                endTime: (0, typeorm_2.MoreThanOrEqual)(new Date()),
            }
        });
    }
    getSingleBuildingQueueElementById(queueElementId) {
        return this.buildingQueueRepository.findOne({
            where: {
                id: queueElementId
            }
        });
    }
    countActiveBuildingQueueElementsForHabitat(habitatId) {
        return this.buildingQueueRepository.count({
            where: {
                buildingZone: {
                    habitatId: habitatId
                },
                endTime: (0, typeorm_2.MoreThanOrEqual)(new Date()),
            }
        });
    }
};
BuildingQueueFetchService = __decorate([
    __param(0, (0, typeorm_1.InjectRepository)(building_queue_element_model_1.BuildingQueueElementModel)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BuildingQueueFetchService);
exports.BuildingQueueFetchService = BuildingQueueFetchService;
//# sourceMappingURL=building-queue-fetch.service.js.map