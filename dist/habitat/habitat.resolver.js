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
exports.HabitatResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const building_zone_service_1 = require("../building-zone/building-zone.service");
const habitat_service_1 = require("./habitat.service");
const NewHabitatInput_1 = require("./input/NewHabitatInput");
const habitat_model_1 = require("./model/habitat.model");
let HabitatResolver = class HabitatResolver {
    constructor(habitatService, buildingZoneService) {
        this.habitatService = habitatService;
        this.buildingZoneService = buildingZoneService;
    }
    habitat(id) {
        return this.habitatService.getHabitatById(id);
    }
    userHabitats(id) {
        return this.habitatService.getHabitatsByUserId(id);
    }
    addHabitat(newHabitatData) {
        return this.habitatService.createNewHabitat(newHabitatData);
    }
    buildingZones(habitat) {
        return this.buildingZoneService.getAllBuildingZonesByHabitatId(habitat.id);
    }
};
__decorate([
    (0, graphql_1.Query)(returns => habitat_model_1.HabitatModel, { nullable: true, description: "Get single habitat by its id", name: "habitat_get" }),
    __param(0, (0, graphql_1.Args)("id", { type: () => graphql_1.Int })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], HabitatResolver.prototype, "habitat", null);
__decorate([
    (0, graphql_1.Query)(returns => [habitat_model_1.HabitatModel], { nullable: true, description: "Get all habitats for single user id", name: "habitat_getForUser" }),
    __param(0, (0, graphql_1.Args)("userId", { type: () => graphql_1.Int })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], HabitatResolver.prototype, "userHabitats", null);
__decorate([
    (0, graphql_1.Mutation)(returns => habitat_model_1.HabitatModel, { description: "Create new habitat for single user", name: "habitat_create" }),
    __param(0, (0, graphql_1.Args)('newHabitatData')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [NewHabitatInput_1.NewHabitatInput]),
    __metadata("design:returntype", void 0)
], HabitatResolver.prototype, "addHabitat", null);
__decorate([
    (0, graphql_1.ResolveField)(),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [habitat_model_1.HabitatModel]),
    __metadata("design:returntype", void 0)
], HabitatResolver.prototype, "buildingZones", null);
HabitatResolver = __decorate([
    (0, graphql_1.Resolver)(of => habitat_model_1.HabitatModel),
    __metadata("design:paramtypes", [habitat_service_1.HabitatService,
        building_zone_service_1.BuildingZoneService])
], HabitatResolver);
exports.HabitatResolver = HabitatResolver;
//# sourceMappingURL=habitat.resolver.js.map