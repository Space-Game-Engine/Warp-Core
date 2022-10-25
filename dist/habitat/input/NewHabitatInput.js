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
exports.NewHabitatInput = void 0;
const graphql_1 = require("@nestjs/graphql");
let NewHabitatInput = class NewHabitatInput {
    constructor() {
        this.name = "default name";
    }
};
__decorate([
    (0, graphql_1.Field)(type => graphql_1.Int, { description: "User id" }),
    __metadata("design:type", Number)
], NewHabitatInput.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, description: "Is that main habitat?" }),
    __metadata("design:type", Boolean)
], NewHabitatInput.prototype, "isMain", void 0);
__decorate([
    (0, graphql_1.Field)({ description: "Name of the habitat" }),
    __metadata("design:type", String)
], NewHabitatInput.prototype, "name", void 0);
NewHabitatInput = __decorate([
    (0, graphql_1.InputType)({ description: "Creates new habitat" })
], NewHabitatInput);
exports.NewHabitatInput = NewHabitatInput;
//# sourceMappingURL=NewHabitatInput.js.map