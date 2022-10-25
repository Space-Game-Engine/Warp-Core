"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildingZoneModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const building_module_1 = require("../building/building.module");
const habitat_module_1 = require("../habitat/habitat.module");
const building_zone_resolver_1 = require("./building-zone.resolver");
const building_zone_service_1 = require("./building-zone.service");
const building_zone_model_1 = require("./model/building-zone.model");
let BuildingZoneModule = class BuildingZoneModule {
    static entities() {
        return [building_zone_model_1.BuildingZoneModel];
    }
};
BuildingZoneModule = __decorate([
    (0, common_1.Module)({
        providers: [building_zone_service_1.BuildingZoneService, building_zone_resolver_1.BuildingZoneResolver],
        imports: [
            typeorm_1.TypeOrmModule.forFeature([building_zone_model_1.BuildingZoneModel]),
            config_1.ConfigModule,
            building_module_1.BuildingModule,
            (0, common_1.forwardRef)(() => habitat_module_1.HabitatModule),
        ],
        exports: [
            building_zone_service_1.BuildingZoneService,
        ]
    })
], BuildingZoneModule);
exports.BuildingZoneModule = BuildingZoneModule;
//# sourceMappingURL=building-zone.module.js.map