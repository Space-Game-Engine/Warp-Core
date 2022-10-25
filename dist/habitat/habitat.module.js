"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabitatModule = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_1 = require("@nestjs/typeorm");
const building_zone_module_1 = require("../building-zone/building-zone.module");
const habitat_resolver_1 = require("./habitat.resolver");
const habitat_service_1 = require("./habitat.service");
const habitat_model_1 = require("./model/habitat.model");
let HabitatModule = class HabitatModule {
    static entities() {
        return [habitat_model_1.HabitatModel];
    }
};
HabitatModule = __decorate([
    (0, common_1.Module)({
        providers: [habitat_service_1.HabitatService, habitat_resolver_1.HabitatResolver],
        imports: [
            building_zone_module_1.BuildingZoneModule,
            event_emitter_1.EventEmitterModule,
            typeorm_1.TypeOrmModule.forFeature([habitat_model_1.HabitatModel]),
        ],
        exports: [
            habitat_service_1.HabitatService,
        ]
    })
], HabitatModule);
exports.HabitatModule = HabitatModule;
//# sourceMappingURL=habitat.module.js.map