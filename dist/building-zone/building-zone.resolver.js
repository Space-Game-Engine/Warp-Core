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
exports.BuildingZoneResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const building_service_1 = require("../building/building.service");
const habitat_service_1 = require("../habitat/habitat.service");
const GetSingleBuildingZoneArgs_1 = require("./args-types/GetSingleBuildingZoneArgs");
const building_zone_service_1 = require("./building-zone.service");
const building_zone_model_1 = require("./model/building-zone.model");
let BuildingZoneResolver = class BuildingZoneResolver {
    constructor(buildingZoneService, habitatService, buildingService) {
        this.buildingZoneService = buildingZoneService;
        this.habitatService = habitatService;
        this.buildingService = buildingService;
    }
    buildingZone({ habitatId, counterPerHabitat }) {
        return this.buildingZoneService.getSingleBuildingZone(counterPerHabitat, habitatId);
    }
    allBuildingZones(id) {
        return this.buildingZoneService.getAllBuildingZonesByHabitatId(id);
    }
    habitat(buildingZone) {
        return this.habitatService.getHabitatById(buildingZone.habitatId);
    }
    building(buildingZone) {
        if (!buildingZone.building) {
            return null;
        }
        return this.buildingService.getBuildingById(buildingZone.building.id);
    }
};
__decorate([
    (0, graphql_1.Query)(returns => building_zone_model_1.BuildingZoneModel, { nullable: true, description: "Returns single building zone", name: "buildingZone_get" }),
    __param(0, (0, graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GetSingleBuildingZoneArgs_1.GetSingleBuildingZoneArgs]),
    __metadata("design:returntype", void 0)
], BuildingZoneResolver.prototype, "buildingZone", null);
__decorate([
    (0, graphql_1.Query)(returns => [building_zone_model_1.BuildingZoneModel], { nullable: true, description: "Returns all building zones for single habitat", name: "buildingZone_getAll" }),
    __param(0, (0, graphql_1.Args)("habitatId", { type: () => graphql_1.Int })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], BuildingZoneResolver.prototype, "allBuildingZones", null);
__decorate([
    (0, graphql_1.ResolveField)(),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [building_zone_model_1.BuildingZoneModel]),
    __metadata("design:returntype", void 0)
], BuildingZoneResolver.prototype, "habitat", null);
__decorate([
    (0, graphql_1.ResolveField)(),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [building_zone_model_1.BuildingZoneModel]),
    __metadata("design:returntype", void 0)
], BuildingZoneResolver.prototype, "building", null);
BuildingZoneResolver = __decorate([
    (0, graphql_1.Resolver)(of => building_zone_model_1.BuildingZoneModel),
    __metadata("design:paramtypes", [building_zone_service_1.BuildingZoneService,
        habitat_service_1.HabitatService,
        building_service_1.BuildingService])
], BuildingZoneResolver);
exports.BuildingZoneResolver = BuildingZoneResolver;
//# sourceMappingURL=building-zone.resolver.js.map