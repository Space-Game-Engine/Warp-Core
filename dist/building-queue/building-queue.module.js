"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildingQueueModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const building_zone_module_1 = require("../building-zone/building-zone.module");
const building_module_1 = require("../building/building.module");
const building_queue_add_service_1 = require("./building-queue-add.service");
const building_queue_element_model_1 = require("./model/building-queue-element.model");
let BuildingQueueModule = class BuildingQueueModule {
    static entities() {
        return [building_queue_element_model_1.BuildingQueueElementModel];
    }
};
BuildingQueueModule = __decorate([
    (0, common_1.Module)({
        providers: [building_queue_add_service_1.BuildingQueueAddService],
        imports: [
            typeorm_1.TypeOrmModule.forFeature([building_queue_element_model_1.BuildingQueueElementModel]),
            building_zone_module_1.BuildingZoneModule,
            building_module_1.BuildingModule,
        ],
        exports: []
    })
], BuildingQueueModule);
exports.BuildingQueueModule = BuildingQueueModule;
//# sourceMappingURL=building-queue.module.js.map