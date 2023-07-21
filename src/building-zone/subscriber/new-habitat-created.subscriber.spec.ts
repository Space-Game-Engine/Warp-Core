import {RuntimeConfig} from "@warp-core/core/config/runtime.config";
import {BuildingZoneService} from "@warp-core/building-zone/building-zone.service";
import {NewHabitatCreatedSubscriber} from "@warp-core/building-zone/subscriber/new-habitat-created.subscriber";
import {Test, TestingModule} from "@nestjs/testing";
import {coreConfigMock} from "@warp-core/test/core-config-mock";
import {HabitatModel} from "@warp-core/database";

jest.mock("@warp-core/building-zone/building-zone.service");
describe("New habitat created - subscriber", () => {
    let runtimeConfig: RuntimeConfig;
    let buildingZoneService: jest.Mocked<BuildingZoneService>;
    let newHabitatCreated: NewHabitatCreatedSubscriber;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BuildingZoneService,
                NewHabitatCreatedSubscriber,
                coreConfigMock,
            ],
        }).compile();

        runtimeConfig = module.get(RuntimeConfig);
        buildingZoneService = module.get(BuildingZoneService);
        newHabitatCreated = module.get(NewHabitatCreatedSubscriber);
    });

    describe("createBuildingZoneOnNewHabitatCreation", () => {
        it("should create building zones for newly created habitat", async () => {
            runtimeConfig.habitat.buildingZones.counterForNewHabitat = 5;
            const newHabitat = {
                id: 5,
            } as HabitatModel;

            await newHabitatCreated.createBuildingZoneOnNewHabitatCreation({habitat: newHabitat}, "abc");

            expect(buildingZoneService.createNewBuildingZone).toBeCalledTimes(
                runtimeConfig.habitat.buildingZones.counterForNewHabitat
            );

            expect(buildingZoneService.createNewBuildingZone).toBeCalledWith(
                newHabitat,
                'abc'
            );
        });
    });
});