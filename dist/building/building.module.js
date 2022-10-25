"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const building_resolver_1 = require("./building.resolver");
const building_service_1 = require("./building.service");
const building_details_at_certain_level_model_1 = require("./model/building-details-at-certain-level.model");
const building_model_1 = require("./model/building.model");
let BuildingModule = class BuildingModule {
    static entities() {
        return [building_model_1.BuildingModel, building_details_at_certain_level_model_1.BuildingDetailsAtCertainLevelModel];
    }
};
BuildingModule = __decorate([
    (0, common_1.Module)({
        providers: [building_service_1.BuildingService, building_resolver_1.BuildingResolver],
        imports: [
            typeorm_1.TypeOrmModule.forFeature([building_model_1.BuildingModel]),
        ],
        exports: [
            building_service_1.BuildingService,
        ]
    })
], BuildingModule);
exports.BuildingModule = BuildingModule;
//# sourceMappingURL=building.module.js.map