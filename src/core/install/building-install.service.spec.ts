import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Role } from "@warp-core/database/enum/role.enum";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { Repository } from "typeorm";
import { BuildingInstallService } from "./building-install.service";

describe("BuildingInstallService", () => {
    let buildingInstallService: BuildingInstallService;
    let saveBuildingSpy: jest.SpyInstance;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BuildingInstallService,
                {
                    provide: getRepositoryToken(BuildingModel),
                    useValue: {
                        save() { },
                    }
                }
            ]
        }).compile();

        buildingInstallService = module.get<BuildingInstallService>(BuildingInstallService);
        let buildingRepository = module.get<Repository<BuildingModel>>(
            getRepositoryToken(BuildingModel)
        );

        saveBuildingSpy = jest.spyOn(buildingRepository, 'save');


        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    describe("install", () => {
        it("should throw error when installation object contains errors", () => {
            const buildingModel = {
                role: "totally_wrong_type",
                name: "Really wrong building",
                buildingDetailsAtCertainLevel: []
            };

            expect(buildingInstallService.install([buildingModel])).rejects.toThrowError("Validation error, see logs");
        });

        it("should add items from array to install", async () => {
            const buildingModel = {
                role: Role.RESOURCE_PRODUCTION,
                name: "Production building",
                buildingDetailsAtCertainLevel: []
            } as BuildingModel;
            
            await buildingInstallService.install([buildingModel]);

            expect(saveBuildingSpy).toBeCalledTimes(1);
            expect(saveBuildingSpy).toBeCalledWith(buildingModel);
        });
    });
});