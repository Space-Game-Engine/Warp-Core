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
exports.BuildingModel = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const building_details_at_certain_level_model_1 = require("./building-details-at-certain-level.model");
const role_enum_1 = require("./role.enum");
let BuildingModel = class BuildingModel {
};
__decorate([
    (0, graphql_1.Field)(type => graphql_1.ID),
    (0, class_validator_1.IsNumber)(),
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BuildingModel.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(type => role_enum_1.Role, { description: "Role says what that building do" }),
    (0, class_validator_1.IsEnum)(role_enum_1.Role),
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], BuildingModel.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)({ description: "What name that kind of building have" }),
    (0, class_validator_1.Length)(15, 255),
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], BuildingModel.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(type => [building_details_at_certain_level_model_1.BuildingDetailsAtCertainLevelModel], { description: "Details how to upgrade that building" }),
    (0, class_validator_1.ValidateNested)(),
    (0, typeorm_1.OneToMany)(() => building_details_at_certain_level_model_1.BuildingDetailsAtCertainLevelModel, (details) => details.building),
    __metadata("design:type", Array)
], BuildingModel.prototype, "buildingDetailsAtCertainLevel", void 0);
BuildingModel = __decorate([
    (0, graphql_1.ObjectType)({ description: "Single building type, describes its role in game" }),
    (0, typeorm_1.Entity)({ name: "building" })
], BuildingModel);
exports.BuildingModel = BuildingModel;
//# sourceMappingURL=building.model.js.map