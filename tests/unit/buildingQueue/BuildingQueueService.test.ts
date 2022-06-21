import {createPrismaClientMock, MockPrismaClient} from "../../PrismaMock";
import {BuildingQueueService} from "../../../src/buildingQueue/BuildingQueueService";
import {isEqual} from "../../isEqual";

let prismaMock: MockPrismaClient;
let buildingQueueService: BuildingQueueService;

beforeEach(() => {
    prismaMock = createPrismaClientMock();
    buildingQueueService = new BuildingQueueService(prismaMock);
});

describe("Building queue service tests", () => {
    describe("Getters for queue elements", () => {
        test("Get all queue elements for single habitat", async () => {
            const habitatId = 5;
            const queueElements = [
                {
                    id: 1,
                    startLevel: 1,
                    endLevel: 2,
                    startTime: new Date(),
                    endTime: new Date(),
                    buildingId: 1,
                    buildingZoneId: 3,
                }
            ]

            prismaMock.buildingQueueElement.findMany.calledWith(isEqual({
                where: {
                    buildingZone: {
                        habitatId: habitatId
                    }
                }
            })).mockResolvedValue(queueElements);

            await expect(buildingQueueService.getBuildingQueueForHabitat(habitatId)).resolves.toEqual(queueElements);
        });
    });
});
