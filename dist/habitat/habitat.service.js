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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabitatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const typeorm_2 = require("typeorm");
const habitat_model_1 = require("./model/habitat.model");
const habitat_created_event_1 = require("./event/habitat-created.event");
let HabitatService = class HabitatService {
    constructor(habitatRepository, eventEmitter) {
        this.habitatRepository = habitatRepository;
        this.eventEmitter = eventEmitter;
    }
    getHabitatById(habitatId) {
        return this.habitatRepository.findOne({
            where: {
                id: habitatId
            },
            loadEagerRelations: false,
        });
    }
    getHabitatsByUserId(userId) {
        return this.habitatRepository.find({
            where: {
                userId: userId
            },
            loadEagerRelations: false
        });
    }
    async createNewHabitat(newHabitatData) {
        const newHabitat = await this.habitatRepository.save(newHabitatData);
        await this.eventEmitter.emitAsync('habitat.create_new', new habitat_created_event_1.HabitatCreatedEvent(newHabitat));
        return newHabitat;
    }
};
HabitatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(habitat_model_1.HabitatModel)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], HabitatService);
exports.HabitatService = HabitatService;
//# sourceMappingURL=habitat.service.js.map