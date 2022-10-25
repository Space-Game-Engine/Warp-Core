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
exports.BuildingQueueElementModel = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const building_zone_model_1 = require("../../building-zone/model/building-zone.model");
const building_model_1 = require("../../building/model/building.model");
let BuildingQueueElementModel = class BuildingQueueElementModel {
};
__decorate([
    (0, graphql_1.Field)(type => graphql_1.ID),
    (0, class_validator_1.IsNumber)(),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BuildingQueueElementModel.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ description: "What was level on queue start?" }),
    (0, class_validator_1.IsNumber)(),
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], BuildingQueueElementModel.prototype, "startLevel", void 0);
__decorate([
    (0, graphql_1.Field)({ description: "What was level on queue end?" }),
    (0, class_validator_1.IsNumber)(),
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], BuildingQueueElementModel.prototype, "endLevel", void 0);
__decorate([
    (0, graphql_1.Field)({ description: "At what time queue element will start?" }),
    (0, class_validator_1.IsDate)(),
    (0, typeorm_1.Column)('datetime'),
    __metadata("design:type", Date)
], BuildingQueueElementModel.prototype, "startTime", void 0);
__decorate([
    (0, graphql_1.Field)({ description: "At what time queue element will end?" }),
    (0, class_validator_1.IsDate)(),
    (0, typeorm_1.Column)('datetime'),
    __metadata("design:type", Date)
], BuildingQueueElementModel.prototype, "endTime", void 0);
__decorate([
    (0, graphql_1.Field)(type => [building_model_1.BuildingModel], { description: "Building connected to queue element" }),
    (0, typeorm_1.ManyToOne)(() => building_model_1.BuildingModel),
    __metadata("design:type", building_model_1.BuildingModel)
], BuildingQueueElementModel.prototype, "building", void 0);
__decorate([
    (0, graphql_1.Field)(type => building_zone_model_1.BuildingZoneModel, { description: "Building zone connected to queue element" }),
    (0, typeorm_1.ManyToOne)(() => building_zone_model_1.BuildingZoneModel),
    __metadata("design:type", building_zone_model_1.BuildingZoneModel)
], BuildingQueueElementModel.prototype, "buildingZone", void 0);
BuildingQueueElementModel = __decorate([
    (0, graphql_1.ObjectType)({ description: "Defines one pending item in building queue" }),
    (0, typeorm_1.Entity)({ name: "building-queue-element" })
], BuildingQueueElementModel);
exports.BuildingQueueElementModel = BuildingQueueElementModel;
//# sourceMappingURL=building-queue-element.model.js.map