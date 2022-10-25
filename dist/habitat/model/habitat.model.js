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
exports.HabitatModel = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const building_zone_model_1 = require("../../building-zone/model/building-zone.model");
let HabitatModel = class HabitatModel {
};
__decorate([
    (0, graphql_1.Field)(type => graphql_1.ID),
    (0, class_validator_1.IsNumber)(),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], HabitatModel.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ description: "Custom name of the habitat" }),
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], HabitatModel.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNumber)(),
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], HabitatModel.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)({ description: "Is that habitat a capital one" }),
    (0, class_validator_1.IsBoolean)(),
    (0, typeorm_1.Column)('boolean'),
    __metadata("design:type", Boolean)
], HabitatModel.prototype, "isMain", void 0);
__decorate([
    (0, graphql_1.Field)(type => [building_zone_model_1.BuildingZoneModel]),
    __metadata("design:type", Array)
], HabitatModel.prototype, "buildingZones", void 0);
HabitatModel = __decorate([
    (0, graphql_1.ObjectType)({ description: "Single habitat that belongs to user" }),
    (0, typeorm_1.Entity)({ name: "habitat" })
], HabitatModel);
exports.HabitatModel = HabitatModel;
//# sourceMappingURL=habitat.model.js.map