import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { PayloadDataService } from "@warp-core/auth/payload/payload-data.service";
import { PayloadDataServiceMock } from "@warp-core/auth/payload/__mocks__/payload-data.service";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { BuildingZoneRepository } from "@warp-core/database/repository/building-zone.repository";
import { when } from "jest-when";
import { BuildingZoneService } from "./building-zone.service";

jest.mock("../database/repository/building-zone.repository");

describe("Building Zone Service", () => {
    let buildingZoneService: BuildingZoneService;
    let buildingZoneRepository: jest.Mocked<BuildingZoneRepository>;
    let payloadDataService: PayloadDataServiceMock;
    let configService: ConfigService;

    beforeEach(async () => {
        jest.clearAllMocks();

        configService = {
            get: jest.fn()
        } as any as ConfigService;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BuildingZoneService,
                BuildingZoneRepository,
                {
                    provide: PayloadDataService,
                    useValue: new PayloadDataServiceMock()
                },
                {
                    provide: ConfigService,
                    useValue: configService
                }
            ]
        }).compile();

        buildingZoneService = module.get<BuildingZoneService>(BuildingZoneService);

        buildingZoneRepository = module.get(BuildingZoneRepository);
        payloadDataService = module.get(PayloadDataService);
    });

    function getHabitatModelMock(habitatId: number): HabitatModel {
        return {
            id: habitatId,
            getAuthId: () => habitatId
        } as any as HabitatModel;
    }

    describe("createNewBuildingZone", () => {
        it("should create first building zone with its counter set as 1", async () => {
            const habitatId = 5;

            when(buildingZoneRepository.getMaxOfCounterPerHabitat)
                .calledWith(habitatId)
                .mockResolvedValue(0);

            await buildingZoneService.createNewBuildingZone({ id: habitatId } as HabitatModel);

            expect(buildingZoneRepository.save).toBeCalledWith(expect.objectContaining({
                localBuildingZoneId: 1,
                habitat: { id: habitatId },
            }));
        });

        it("should create second building zone with its counter set as 2", async () => {
            const habitatId = 5;

            when(buildingZoneRepository.getMaxOfCounterPerHabitat)
                .calledWith(habitatId)
                .mockResolvedValue(1);

            await buildingZoneService.createNewBuildingZone({ id: habitatId } as HabitatModel);

            expect(buildingZoneRepository.save).toBeCalledWith(expect.objectContaining({
                localBuildingZoneId: 2,
                habitat: { id: habitatId },
            }));
        });
    });

    describe("getAllZonesForCurrentHabitat", () => {
        it("should return array with buildings", async () => {
            const habitatId = 5;
            const habitatModel = getHabitatModelMock(habitatId);
            const buildingZones = [
                {
                    id: 1,
                    level: 1,
                    localBuildingZoneId: 1,
                },
                {
                    id: 2,
                    level: 0,
                    localBuildingZoneId: 2,
                },
            ] as BuildingZoneModel[];

            payloadDataService.getModel.mockResolvedValue(habitatModel);
            when(buildingZoneRepository.getAllBuildingZonesByHabitatId)
                .calledWith(habitatId)
                .mockResolvedValue(buildingZones);

            const buildingZonesFromService = await buildingZoneService.getAllZonesForCurrentHabitat();

            expect(buildingZonesFromService).toEqual(buildingZones);
        });
    });

    describe("getSingleBuildingZone", () => {
        it("should return single building zone for provided counter", async () => {
            const localBuildingZoneId = 1;
            const habitatId = 5;
            const habitatModel = getHabitatModelMock(habitatId);
            const buildingZone = 
                {
                    id: 1,
                    level: 1,
                    localBuildingZoneId: localBuildingZoneId,
                } as BuildingZoneModel;

            payloadDataService.getModel.mockResolvedValue(habitatModel);
            when(buildingZoneRepository.getSingleBuildingZone)
                .calledWith(localBuildingZoneId, habitatId)
                .mockResolvedValue(buildingZone);

            const buildingZoneFromService = await buildingZoneService.getSingleBuildingZone(localBuildingZoneId);

            expect(buildingZoneFromService).toEqual(buildingZone);
        });
    });
});
