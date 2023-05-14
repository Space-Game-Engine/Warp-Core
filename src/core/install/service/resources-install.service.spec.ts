import { Test, TestingModule } from "@nestjs/testing";
import { ResourcesInstallService } from "@warp-core/core/install/service/resources-install.service";
import { ResourceType } from "@warp-core/database/enum/resource-type.enum";
import { ResourceModel } from "@warp-core/database/model/resource.model";
import { ResourceRepository } from "@warp-core/database/repository/resource.repository";

jest.mock("../../../database/repository/resource.repository");

describe("ResourcesInstallService", () => {
    let resourcesInstallService: ResourcesInstallService;
    let resourceRepository: jest.Mocked<ResourceRepository>;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ResourcesInstallService,
                ResourceRepository,
            ]
        }).compile();

        resourcesInstallService = module.get<ResourcesInstallService>(ResourcesInstallService);
        resourceRepository = module.get(ResourceRepository);
    });

    describe("install", () => {
        it("should throw error when installation object contains errors", () => {
            const resourceModel = {
                name: "Really wrong building",
                baseMaxCapacity: "this is not a number",
                type: "unknown type",
            };

            expect(resourcesInstallService.install([resourceModel])).rejects.toThrowError("Validation error, see logs");
        });

        it("should add items from array to install", async () => {
            const resourceModel = {
                id: "resource",
                name: "useful resource",
                baseMaxCapacity: 100,
                type: ResourceType.CONSTRUCTION_RESOURCE
            } as ResourceModel;
            
            await resourcesInstallService.install([resourceModel]);

            expect(resourceRepository.save).toBeCalledTimes(1);
            expect(resourceRepository.save).toBeCalledWith(resourceModel);
        });
    });
});