import { Test, TestingModule } from "@nestjs/testing";
import { BuildingZoneExistsConstraint } from "@warp-core/building-queue/input/validator/building-zone-exists.validator";
import { BuildingZoneService } from "@warp-core/building-zone/building-zone.service";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { ValidationArguments } from "class-validator";
import { when } from "jest-when";

jest.mock("../../../building-zone/building-zone.service");

describe("Building zone exists validator", () => {
    let buildingZoneExistsConstraint: BuildingZoneExistsConstraint;
    let buildingZoneService: jest.Mocked<BuildingZoneService>;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BuildingZoneExistsConstraint,
                BuildingZoneService,
            ]
        }).compile();

        buildingZoneExistsConstraint = module.get(BuildingZoneExistsConstraint);
        buildingZoneService = module.get(BuildingZoneService);
    });

    it("should fail validation when building zone was not found in current habitat", async () => {
        const counterPerHabitat = 10;
        const validationArguments = {} as ValidationArguments;

        when(buildingZoneService.getSingleBuildingZone)
            .calledWith(counterPerHabitat)
            .mockResolvedValue(null);

        expect(buildingZoneExistsConstraint.validate(counterPerHabitat, validationArguments)).resolves.toEqual(false);
    });

    it("should pass validation when building zone exists", async () => {
        const counterPerHabitat = 10;
        const validationArguments = {} as ValidationArguments;

        when(buildingZoneService.getSingleBuildingZone)
            .calledWith(counterPerHabitat)
            .mockResolvedValue({} as BuildingZoneModel);

        expect(buildingZoneExistsConstraint.validate(counterPerHabitat, validationArguments)).resolves.toEqual(true);
    });
});