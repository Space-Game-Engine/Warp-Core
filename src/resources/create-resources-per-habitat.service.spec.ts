import { Test, TestingModule } from "@nestjs/testing";
import { HabitatModel, HabitatResourceModel, HabitatResourceRepository, ResourceModel, ResourceRepository } from "@warp-core/database";
import { HabitatCreatedEvent } from "@warp-core/habitat";
import { CreateResourcesPerHabitat } from "@warp-core/resources/create-resources-per-habitat.service";

jest.mock("@warp-core/database/repository/habitat-resource.repository");
jest.mock("@warp-core/database/repository/resource.repository");

describe("Create resources per habitat service tests", () => {
    let createResourcesPerHabitat: CreateResourcesPerHabitat;
    let habitatResourceRepository: jest.Mocked<HabitatResourceRepository>;
    let resourceRepository: jest.Mocked<ResourceRepository>;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateResourcesPerHabitat,
                HabitatResourceRepository,
                ResourceRepository,
            ]
        }).compile();

        createResourcesPerHabitat = module.get<CreateResourcesPerHabitat>(CreateResourcesPerHabitat);
        habitatResourceRepository = module.get(HabitatResourceRepository);
        resourceRepository = module.get(ResourceRepository);
    });

    describe("createResourcesPerHabitat", () => {
        it("should not save any resources when resources list is empty", async () => {
            const resourcesList = [] as ResourceModel[];
            const habitat = {
                id: 1
            } as HabitatModel;

            resourceRepository.find.mockResolvedValue(resourcesList);

            await createResourcesPerHabitat.createResourcesPerHabitat(new HabitatCreatedEvent(habitat));

            expect(habitatResourceRepository.save).toBeCalledTimes(0);
        });

        it("should save one habitat resource when there is one resource to be saved", async() => {
            const resourcesList = [{
                id: 'wood'
            }] as ResourceModel[];
            const habitat = {
                id: 1
            } as HabitatModel;

            resourceRepository.find.mockResolvedValue(resourcesList);

            await createResourcesPerHabitat.createResourcesPerHabitat(new HabitatCreatedEvent(habitat));

            expect(habitatResourceRepository.save).toBeCalledTimes(1);
            expect(habitatResourceRepository.save).toHaveBeenCalledWith(
                expect.arrayContaining<HabitatResourceModel>([
                    expect.objectContaining({
                        habitat: habitat,
                        resource: resourcesList[0]
                    })
                ])
            )
        });

        it("should save multiple habitat resource when there are multiple resources to be saved", async() => {
            const resourcesList = [
                {
                    id: 'wood'
                },
                {
                    id: 'stone'
                },
                {
                    id: 'water'
                },
            ] as ResourceModel[];
            const habitat = {
                id: 1
            } as HabitatModel;

            resourceRepository.find.mockResolvedValue(resourcesList);

            await createResourcesPerHabitat.createResourcesPerHabitat(new HabitatCreatedEvent(habitat));

            expect(habitatResourceRepository.save).toBeCalledTimes(1);
            expect(habitatResourceRepository.save).toHaveBeenCalledWith(
                expect.arrayContaining<HabitatResourceModel>([
                    expect.objectContaining({
                        habitat: habitat,
                        resource: resourcesList[0]
                    }),
                    expect.objectContaining({
                        habitat: habitat,
                        resource: resourcesList[1]
                    }),
                    expect.objectContaining({
                        habitat: habitat,
                        resource: resourcesList[2]
                    }),
                ])
            )
        });
    });

});