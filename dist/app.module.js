"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AppModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const event_emitter_1 = require("@nestjs/event-emitter");
const apollo_1 = require("@nestjs/apollo");
const path_1 = require("path");
const building_module_1 = require("./building/building.module");
const typeorm_1 = require("@nestjs/typeorm");
const habitat_module_1 = require("./habitat/habitat.module");
const building_zone_module_1 = require("./building-zone/building-zone.module");
const config_1 = require("@nestjs/config");
const ConfigParser_1 = require("./core/config/ConfigParser");
const building_queue_module_1 = require("./building-queue/building-queue.module");
let AppModule = AppModule_1 = class AppModule {
    static entities() {
        return [
            ...building_module_1.BuildingModule.entities(),
            ...habitat_module_1.HabitatModule.entities(),
            ...building_zone_module_1.BuildingZoneModule.entities(),
            ...building_queue_module_1.BuildingQueueModule.entities(),
        ];
    }
};
AppModule = AppModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [
            event_emitter_1.EventEmitterModule.forRoot(),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'better-sqlite3',
                database: 'mydb.db',
                entities: AppModule_1.entities(),
                synchronize: true,
            }),
            building_module_1.BuildingModule,
            habitat_module_1.HabitatModule,
            building_zone_module_1.BuildingZoneModule,
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [ConfigParser_1.default],
            }),
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map