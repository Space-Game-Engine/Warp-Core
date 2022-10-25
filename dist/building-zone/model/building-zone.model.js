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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildingZoneModel = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const building_model_1 = require("../../building/model/building.model");
const habitat_model_1 = require("../../habitat/model/habitat.model");
let BuildingZoneModel = class BuildingZoneModel {
    constructor() {
        this.level = 0;
    }
};
BuildingZoneModel.MINIMAL_BUILDING_LEVEL = 1;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BuildingZoneModel.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ description: "Building zone id counted for single habitat", name: "zoneId" }),
    (0, class_validator_1.IsNumber)(),
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], BuildingZoneModel.prototype, "counterPerHabitat", void 0);
__decorate([
    (0, graphql_1.Field)(type => habitat_model_1.HabitatModel, { description: "Habitat connected to that building zone" }),
    (0, class_validator_1.ValidateNested)(),
    (0, typeorm_1.ManyToOne)(() => habitat_model_1.HabitatModel, (habitat) => habitat.buildingZones),
    (0, typeorm_1.JoinColumn)({ name: 'habitatId' }),
    __metadata("design:type", habitat_model_1.HabitatModel)
], BuildingZoneModel.prototype, "habitat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'habitatId' }),
    __metadata("design:type", Number)
], BuildingZoneModel.prototype, "habitatId", void 0);
__decorate([
    (0, graphql_1.Field)(type => building_model_1.BuildingModel, { nullable: true, description: "What kind of building is placed here" }),
    (0, typeorm_1.ManyToOne)(() => building_model_1.BuildingModel),
    (0, typeorm_1.JoinColumn)({ name: 'buildingId' }),
    __metadata("design:type", building_model_1.BuildingModel)
], BuildingZoneModel.prototype, "building", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'buildingId', nullable: true }),
    __metadata("design:type", Number)
], BuildingZoneModel.prototype, "buildingId", void 0);
__decorate([
    (0, graphql_1.Field)({ description: "What level is that" }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], BuildingZoneModel.prototype, "level", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, description: "Where is that building zone placed in our habitat" }),
    (0, typeorm_1.Column)('simple-json'),
    __metadata("design:type", String)
], BuildingZoneModel.prototype, "placement", void 0);
BuildingZoneModel = __decorate([
    (0, graphql_1.ObjectType)({ description: "Single building zone, you can build here single building and level it up" }),
    (0, typeorm_1.Entity)({ name: "building-zone" })
], BuildingZoneModel);
exports.BuildingZoneModel = BuildingZoneModel;
//# sourceMappingURL=building-zone.model.js.map