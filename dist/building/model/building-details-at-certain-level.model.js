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
exports.BuildingDetailsAtCertainLevelModel = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const building_model_1 = require("./building.model");
let BuildingDetailsAtCertainLevelModel = class BuildingDetailsAtCertainLevelModel {
};
__decorate([
    (0, graphql_1.Field)(type => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BuildingDetailsAtCertainLevelModel.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(type => building_model_1.BuildingModel, { description: "Building connected to that details" }),
    (0, typeorm_1.ManyToOne)(() => building_model_1.BuildingModel, (building) => building.buildingDetailsAtCertainLevel),
    __metadata("design:type", building_model_1.BuildingModel)
], BuildingDetailsAtCertainLevelModel.prototype, "building", void 0);
__decorate([
    (0, graphql_1.Field)(type => graphql_1.Int, { description: "What level is described by this entry" }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], BuildingDetailsAtCertainLevelModel.prototype, "level", void 0);
__decorate([
    (0, graphql_1.Field)(type => graphql_1.Int, { description: "How much time it takes to upgrade that building" }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], BuildingDetailsAtCertainLevelModel.prototype, "timeToUpdateBuildingInSeconds", void 0);
BuildingDetailsAtCertainLevelModel = __decorate([
    (0, graphql_1.ObjectType)({ description: "Details how to upgrade single building" }),
    (0, typeorm_1.Entity)({ name: "building-details-at-certain-level" })
], BuildingDetailsAtCertainLevelModel);
exports.BuildingDetailsAtCertainLevelModel = BuildingDetailsAtCertainLevelModel;
//# sourceMappingURL=building-details-at-certain-level.model.js.map