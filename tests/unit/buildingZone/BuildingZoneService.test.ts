import { MockPrismaClient, createMockContext } from '../../PrismaMock';
import { BuildingZoneService } from '../../../src/buildingZone/BuildingZoneService';

let prismaMock: MockPrismaClient;
let buildingZoneService: BuildingZoneService;

beforeEach(() => {
    prismaMock = createMockContext();
    buildingZoneService = new BuildingZoneService(prismaMock);
});

describe('Tests of bulding zone service', () => {
    test('Count building zones on habitat', async () => {
        const habitatId = 5;
        const countedElements = 10;

        prismaMock.buildingZone.count.mockResolvedValue(countedElements).calledWith({where: {habitatId: habitatId}});

        await expect(buildingZoneService.countBuildingZonesOnHabitatByHabitatId(habitatId)).resolves.toBe(countedElements);
    });

    test('Get single building zone for one habitat', async () => {
        const habitatId = 5;
        const counterPerHabitat = 1;

        const buildingZone = {
            id: 3,
            habitatId: habitatId,
            buildingId: null,
            level: 0,
            placement: 'fake',
            counterPerHabitat: counterPerHabitat
        };

        prismaMock.buildingZone.findFirst.mockResolvedValue(buildingZone).calledWith({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        });

        await expect(buildingZoneService.getSingleBuildingZone(counterPerHabitat, habitatId)).resolves.toBe(buildingZone);
    });

    // test('Get all building zones for one habitat')

    test('Should create new building zone for existing habitat when there is no building zones for that habitat', async () => {
        const habitatId = 5;
        const existingHabitats = 0;

        const newBuildingZone = {
            id: 3,
            habitatId: habitatId,
            buildingId: null,
            level: 0,
            placement: null,
            counterPerHabitat: existingHabitats + 1
        };

        prismaMock.buildingZone.count.mockResolvedValue(existingHabitats).calledWith({
            where: {
                habitatId: habitatId
            }
        });

        prismaMock.buildingZone.create.mockResolvedValue(newBuildingZone).calledWith({
            data: {
                counterPerHabitat: existingHabitats + 1,
                habitatId: habitatId
            }
        })
    });
});