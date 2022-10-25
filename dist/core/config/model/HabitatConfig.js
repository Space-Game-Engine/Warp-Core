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
exports.HabitatConfig = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const BuildingQueueConfig_1 = require("./BuildingQueueConfig");
const BuildingZonesConfig_1 = require("./BuildingZonesConfig");
class HabitatConfig {
}
__decorate([
    (0, class_transformer_1.Type)(() => BuildingZonesConfig_1.BuildingZoneConfig),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", BuildingZonesConfig_1.BuildingZoneConfig)
], HabitatConfig.prototype, "buildingZones", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => BuildingQueueConfig_1.BuildingQueueConfig),
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", BuildingQueueConfig_1.BuildingQueueConfig)
], HabitatConfig.prototype, "buildingQueue", void 0);
exports.HabitatConfig = HabitatConfig;
//# sourceMappingURL=HabitatConfig.js.map