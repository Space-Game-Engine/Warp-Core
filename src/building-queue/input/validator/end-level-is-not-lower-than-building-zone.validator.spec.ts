import { Test, TestingModule } from "@nestjs/testing";
import { EndLevelIsNotLowerThanBuildingZoneConstraint } from "@warp-core/building-queue/input/validator/end-level-is-not-lower-than-building-zone.validator";
import { BuildingZoneService } from "@warp-core/building-zone/building-zone.service";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { ValidationArguments } from "class-validator";
import { when } from "jest-when";

jest.mock("../../../building-zone/building-zone.service");

describe("End level in add to queue is not lower than building zone", () => {
    let endLevelIsLowerConstraint: EndLevelIsNotLowerThanBuildingZoneConstraint;
    let buildingZoneService: jest.Mocked<BuildingZoneService>;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EndLevelIsNotLowerThanBuildingZoneConstraint,
                BuildingZoneService,
            ]
        }).compile();

        endLevelIsLowerConstraint = module.get(EndLevelIsNotLowerThanBuildingZoneConstraint);
        buildingZoneService = module.get(BuildingZoneService);
    });

    it("should fail validation when building zone was not found in current habitat", async () => {
        const queueEndLevel = 5;
        const counterPerHabitat = 10;
        const validationArguments = {
            object: {
                counterPerHabitat: counterPerHabitat
            }
        } as ValidationArguments;

        when(buildingZoneService.getSingleBuildingZone)
            .calledWith(counterPerHabitat)
            .mockResolvedValue(null);

        expect(endLevelIsLowerConstraint.validate(queueEndLevel, validationArguments)).resolves.toEqual(false);
    });

    it("should fail validation when building zone exists but its level is higher than level in new queue element", async () => {
        const queueEndLevel = 5;
        const counterPerHabitat = 10;
        const validationArguments = {
            object: {
                counterPerHabitat: counterPerHabitat
            }
        } as ValidationArguments;

        when(buildingZoneService.getSingleBuildingZone)
            .calledWith(counterPerHabitat)
            .mockResolvedValue({
                level: 6
            } as BuildingZoneModel);

        expect(endLevelIsLowerConstraint.validate(queueEndLevel, validationArguments)).resolves.toEqual(false);
    });

    it("should fail validation when building zone exists but its level equals level in new queue element", async () => {
        const queueEndLevel = 5;
        const counterPerHabitat = 10;
        const validationArguments = {
            object: {
                counterPerHabitat: counterPerHabitat
            }
        } as ValidationArguments;

        when(buildingZoneService.getSingleBuildingZone)
            .calledWith(counterPerHabitat)
            .mockResolvedValue({
                level: queueEndLevel
            } as BuildingZoneModel);

        expect(endLevelIsLowerConstraint.validate(queueEndLevel, validationArguments)).resolves.toEqual(false);
    });

    it("should pass validation when building zone exists and its level is lower than level in new queue element", async () => {
        const queueEndLevel = 5;
        const counterPerHabitat = 10;
        const validationArguments = {
            object: {
                counterPerHabitat: counterPerHabitat
            }
        } as ValidationArguments;

        when(buildingZoneService.getSingleBuildingZone)
            .calledWith(counterPerHabitat)
            .mockResolvedValue({
                level: 4
            } as BuildingZoneModel);

        expect(endLevelIsLowerConstraint.validate(queueEndLevel, validationArguments)).resolves.toEqual(true);
    });
});