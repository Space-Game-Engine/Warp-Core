import { Test, TestingModule } from "@nestjs/testing";
import { IsBuildingIdProvidedConstraint } from "@warp-core/building-queue/input/validator/is-building-id-provided.validator";
import { BuildingZoneService } from "@warp-core/building-zone/building-zone.service";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { ValidationArguments } from "class-validator";
import { when } from "jest-when";

jest.mock("../../../building-zone/building-zone.service");

describe("Is building id provided", () => {
    let isBuildingIdProvidedConstraint: IsBuildingIdProvidedConstraint;
    let buildingZoneService: jest.Mocked<BuildingZoneService>;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IsBuildingIdProvidedConstraint,
                BuildingZoneService,
            ]
        }).compile();

        isBuildingIdProvidedConstraint = module.get(IsBuildingIdProvidedConstraint);
        buildingZoneService = module.get(BuildingZoneService);
    });

    it("should pass validation if building id was provided", async () => {
        const buildingId = 5;
        const validationArguments = {} as ValidationArguments;

        expect(isBuildingIdProvidedConstraint.validate(buildingId, validationArguments)).resolves.toEqual(true);
    });
});