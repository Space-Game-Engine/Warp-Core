import "reflect-metadata";
import {createPrismaClientMock, MockPrismaClient} from '../../PrismaMock';
import {BuildingZoneService} from '../../../src/buildingZone/BuildingZoneService';
import {DeepMockProxy, mockDeep} from 'jest-mock-extended'
import {BuildingService} from '../../../src/building/BuildingService';
import {BuildingZoneUserInputError} from '../../../src/buildingZone/BuildingZoneUserInputError';
import {isEqual} from "../../isEqual";
import {testConfig} from "../../TestConfig";
import {Habitat} from "../../../src/habitat/Habitat";

let prismaMock: MockPrismaClient;
let buildingZoneService: BuildingZoneService;
let buildingService: DeepMockProxy<BuildingService>;
let config;

beforeEach(() => {
    prismaMock = createPrismaClientMock();
    buildingService = mockDeep<BuildingService>();
    config = testConfig;
    buildingZoneService = new BuildingZoneService(prismaMock, config, buildingService);
});

describe('Tests of building zone service', () => {
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

        prismaMock.buildingZone.findFirst.calledWith(isEqual({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZone);

        await expect(buildingZoneService.getSingleBuildingZone(counterPerHabitat, habitatId)).resolves.toBe(buildingZone);
    });

    test('Get all building zones for one habitat', async () => {
        const habitatId = 5;
        const buildingZones = [
            {
                id: 3,
                habitatId: habitatId,
                buildingId: null,
                level: 0,
                placement: 'fake',
                counterPerHabitat: 1
            },
            {
                id: 7,
                habitatId: habitatId,
                buildingId: null,
                level: 0,
                placement: 'fake',
                counterPerHabitat: 2
            },
            {
                id: 10,
                habitatId: habitatId,
                buildingId: null,
                level: 0,
                placement: 'fake',
                counterPerHabitat: 3
            },
        ];

        prismaMock.buildingZone.findMany.calledWith(isEqual({
            where: {
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZones);

        await expect(buildingZoneService.getAllBuildingZonesByHabitatId(habitatId)).resolves.toBe(buildingZones);
    });

    test('Should return max building zone counter as zero when there is no building zones for that habitat', async () => {
        const habitatId = 5;
        const buildingZones = [];

        prismaMock.buildingZone.findMany.calledWith(isEqual({
            where: {
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZones);

        await expect(buildingZoneService.getMaxOfCounterPerHabitat(habitatId)).resolves.toBe(0);
    });

    test('Should return max building zone counter as one when there is one and first building zone for that habitat', async () => {
        const habitatId = 5;
        const buildingZones = [{
            id: 3,
            habitatId: habitatId,
            buildingId: null,
            level: 0,
            placement: 'fake',
            counterPerHabitat: 1
        }];

        prismaMock.buildingZone.findMany.calledWith(isEqual({
            where: {
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZones);

        await expect(buildingZoneService.getMaxOfCounterPerHabitat(habitatId)).resolves.toBe(1);
    });

    test('Should return max building zone counter as three when there are three buildings zones for that habitat, one after another', async () => {
        const habitatId = 5;
        const buildingZones = [
            {
                id: 3,
                habitatId: habitatId,
                buildingId: null,
                level: 0,
                placement: 'fake',
                counterPerHabitat: 1
            },
            {
                id: 5,
                habitatId: habitatId,
                buildingId: null,
                level: 0,
                placement: 'fake',
                counterPerHabitat: 2
            },
            {
                id: 8,
                habitatId: habitatId,
                buildingId: null,
                level: 0,
                placement: 'fake',
                counterPerHabitat: 3
            },
        ];

        prismaMock.buildingZone.findMany.calledWith(isEqual({
            where: {
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZones);

        await expect(buildingZoneService.getMaxOfCounterPerHabitat(habitatId)).resolves.toBe(3);
    });

    test('Should return max building zone counter as three when there are two buildings zones for that habitat without first one', async () => {
        const habitatId = 5;
        const buildingZones = [
            {
                id: 5,
                habitatId: habitatId,
                buildingId: null,
                level: 0,
                placement: 'fake',
                counterPerHabitat: 2
            },
            {
                id: 8,
                habitatId: habitatId,
                buildingId: null,
                level: 0,
                placement: 'fake',
                counterPerHabitat: 3
            },
        ];

        prismaMock.buildingZone.findMany.calledWith(isEqual({
            where: {
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZones);

        await expect(buildingZoneService.getMaxOfCounterPerHabitat(habitatId)).resolves.toBe(3);
    });

    test('Should create new building zone for existing habitat when there is no building zones for that habitat', async () => {
        const habitatId = 5;
        const newHabitatCounter = 1;
        const existingBuildingZones = [];

        const newBuildingZone = {
            id: 3,
            habitatId: habitatId,
            buildingId: null,
            level: 0,
            placement: null,
            counterPerHabitat: newHabitatCounter
        };

        prismaMock.buildingZone.findMany.calledWith(isEqual({
            where: {
                habitatId: habitatId
            }
        })).mockResolvedValue(existingBuildingZones);

        prismaMock.buildingZone.create.calledWith(isEqual({
            data: {
                counterPerHabitat: newHabitatCounter,
                habitatId: habitatId
            }
        })).mockResolvedValue(newBuildingZone);

        await expect(buildingZoneService.createNewBuildingZone(habitatId)).resolves.toBe(newBuildingZone);
    });

    test('Should create new building zone for existing habitat when there are multiple building zones for that habitat', async () => {
        const habitatId = 5;
        const newHabitatCounter = 6;
        const existingBuildingZones = [
            {
                id: 5,
                habitatId: habitatId,
                buildingId: null,
                level: 0,
                placement: 'fake',
                counterPerHabitat: 1
            },
            {
                id: 5,
                habitatId: habitatId,
                buildingId: null,
                level: 0,
                placement: 'fake',
                counterPerHabitat: 4
            },
            {
                id: 8,
                habitatId: habitatId,
                buildingId: null,
                level: 0,
                placement: 'fake',
                counterPerHabitat: 5
            },
        ];

        const newBuildingZone = {
            id: 3,
            habitatId: habitatId,
            buildingId: null,
            level: 0,
            placement: null,
            counterPerHabitat: newHabitatCounter
        };

        prismaMock.buildingZone.findMany.calledWith(isEqual({
            where: {
                habitatId: habitatId
            }
        })).mockResolvedValue(existingBuildingZones);

        prismaMock.buildingZone.create.calledWith(isEqual({
            data: {
                counterPerHabitat: newHabitatCounter,
                habitatId: habitatId
            }
        })).mockResolvedValue(newBuildingZone);

        await expect(buildingZoneService.createNewBuildingZone(habitatId)).resolves.toBe(newBuildingZone);
    });

    test('Should construct new building when building zone exists and is empty', async () => {
        const habitatId = 5;
        const counterPerHabitat = 1;
        const buildingId = 20;

        const buildingZone = {
            id: 5,
            habitatId: habitatId,
            buildingId: null,
            level: 0,
            placement: 'fake',
            counterPerHabitat: counterPerHabitat
        };

        const building = {
            id: buildingId,
            name: 'test',
            role: 5
        };

        const updatedBuildingZone = {
            id: buildingZone.id,
            habitatId: buildingZone.habitatId,
            buildingId: building.id,
            level: 1,
            placement: buildingZone.placement,
            counterPerHabitat: buildingZone.counterPerHabitat,
        };

        prismaMock.buildingZone.findFirst.calledWith(isEqual({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZone);

        buildingService.getBuildingById.calledWith(isEqual(buildingId)).mockResolvedValue(building);

        prismaMock.buildingZone.update.calledWith(isEqual({
            where: {
                id: buildingZone.id,
            },
            data: {
                buildingId: building.id,
                level: 1,
            }
        })).mockResolvedValue(updatedBuildingZone);

        await expect(buildingZoneService.constructBuildingOnBuildingZone(counterPerHabitat, habitatId, { buildingId: buildingId })).resolves.toBe(updatedBuildingZone);
    });

    test('Should throw exception when building not exists', async () => {
        const habitatId = 5;
        const counterPerHabitat = 1;
        const buildingId = 20;

        const buildingZone = {
            id: 5,
            habitatId: habitatId,
            buildingId: null,
            level: 0,
            placement: 'fake',
            counterPerHabitat: counterPerHabitat
        };

        const building = null;

        prismaMock.buildingZone.findFirst.calledWith(isEqual({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZone);

        buildingService.getBuildingById.calledWith(isEqual(buildingId)).mockResolvedValue(building);

        await expect(buildingZoneService.constructBuildingOnBuildingZone(counterPerHabitat, habitatId, { buildingId: buildingId })).rejects.toThrow(BuildingZoneUserInputError);
    });

    test('Should throw exception when building zone not exists', async () => {
        const habitatId = 5;
        const counterPerHabitat = 10;
        const buildingId = 20;

        const buildingZone = null;

        const building = {
            id: buildingId,
            name: 'test',
            role: 5
        };

        prismaMock.buildingZone.findFirst.calledWith(isEqual({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZone);

        buildingService.getBuildingById.calledWith(isEqual(buildingId)).mockResolvedValue(building);

        await expect(buildingZoneService.constructBuildingOnBuildingZone(counterPerHabitat, habitatId, { buildingId: buildingId })).rejects.toThrow(BuildingZoneUserInputError);
    });

    test('Should throw exception when building zone already have connected building', async () => {
        const habitatId = 5;
        const counterPerHabitat = 1;
        const buildingId = 20;

        const buildingZone = {
            id: 5,
            habitatId: habitatId,
            buildingId: buildingId,
            level: 0,
            placement: 'fake',
            counterPerHabitat: counterPerHabitat
        };

        const building = {
            id: buildingId,
            name: 'test',
            role: 5
        };

        prismaMock.buildingZone.findFirst.calledWith(isEqual({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZone);

        buildingService.getBuildingById.calledWith(isEqual(buildingId)).mockResolvedValue(building);

        await expect(buildingZoneService.constructBuildingOnBuildingZone(counterPerHabitat, habitatId, { buildingId: buildingId })).rejects.toThrow(BuildingZoneUserInputError);
    });

    test('Should upgrade level on building zone when building zone exists and is connected to building', async () => {
        const habitatId = 5;
        const counterPerHabitat = 1;
        const buildingId = 20;

        const buildingZone = {
            id: 5,
            habitatId: habitatId,
            buildingId: buildingId,
            level: 1,
            placement: 'fake',
            counterPerHabitat: counterPerHabitat
        };

        const updatedBuildingZone = {
            id: buildingZone.id,
            habitatId: buildingZone.habitatId,
            buildingId: buildingZone.id,
            level: buildingZone.level + 1,
            placement: buildingZone.placement,
            counterPerHabitat: buildingZone.counterPerHabitat,
        };

        prismaMock.buildingZone.findFirst.calledWith(isEqual({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZone);

        prismaMock.buildingZone.update.calledWith(isEqual({
            where: {
                id: buildingZone.id,
            },
            data: {
                level: buildingZone.level + 1,
            }
        })).mockResolvedValue(updatedBuildingZone);

        await expect(buildingZoneService.upgradeBuildingZone(counterPerHabitat, habitatId)).resolves.toBe(updatedBuildingZone);
    });

    test('Should not upgrade level on building zone and throw exception when building zone not exists', async () => {
        const habitatId = 5;
        const counterPerHabitat = 1;

        const buildingZone = null;

        prismaMock.buildingZone.findFirst.calledWith(isEqual({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZone);

        await expect(buildingZoneService.upgradeBuildingZone(counterPerHabitat, habitatId)).rejects.toThrow(BuildingZoneUserInputError);
    });

    test('Should not upgrade level on building zone and throw exception when building zone exists but is not connected to any building', async () => {
        const habitatId = 5;
        const counterPerHabitat = 1;
        const buildingId = null;

        const buildingZone = {
            id: 5,
            habitatId: habitatId,
            buildingId: buildingId,
            level: 1,
            placement: 'fake',
            counterPerHabitat: counterPerHabitat
        };

        prismaMock.buildingZone.findFirst.calledWith(isEqual({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZone);

        await expect(buildingZoneService.upgradeBuildingZone(counterPerHabitat, habitatId)).rejects.toThrow(BuildingZoneUserInputError);
    });

    test('Should downgrade level on building zone when building zone exists and is connected to building and existing building level is higer than 1', async () => {
        const habitatId = 5;
        const counterPerHabitat = 1;
        const buildingId = 20;

        const buildingZone = {
            id: 5,
            habitatId: habitatId,
            buildingId: buildingId,
            level: 3,
            placement: 'fake',
            counterPerHabitat: counterPerHabitat
        };

        const updatedBuildingZone = {
            id: buildingZone.id,
            habitatId: buildingZone.habitatId,
            buildingId: buildingZone.id,
            level: buildingZone.level - 1,
            placement: buildingZone.placement,
            counterPerHabitat: buildingZone.counterPerHabitat,
        };

        prismaMock.buildingZone.findFirst.calledWith(isEqual({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZone);

        prismaMock.buildingZone.update.calledWith(isEqual({
            where: {
                id: buildingZone.id,
            },
            data: {
                level: buildingZone.level - 1,
            }
        })).mockResolvedValue(updatedBuildingZone);

        await expect(buildingZoneService.downgradeBuildingZone(counterPerHabitat, habitatId)).resolves.toBe(updatedBuildingZone);
    });

    test('Should not downgrade level on building zone when building zone exists and is connected to building and existing building level equals 1', async () => {
        const habitatId = 5;
        const counterPerHabitat = 1;
        const buildingId = 20;

        const buildingZone = {
            id: 5,
            habitatId: habitatId,
            buildingId: buildingId,
            level: 1,
            placement: 'fake',
            counterPerHabitat: counterPerHabitat
        };

        const updatedBuildingZone = {
            id: buildingZone.id,
            habitatId: buildingZone.habitatId,
            buildingId: buildingZone.id,
            level: buildingZone.level,
            placement: buildingZone.placement,
            counterPerHabitat: buildingZone.counterPerHabitat,
        };

        prismaMock.buildingZone.findFirst.calledWith(isEqual({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZone);

        prismaMock.buildingZone.update.calledWith(isEqual({
            where: {
                id: buildingZone.id,
            },
            data: {
                level: buildingZone.level,
            }
        })).mockResolvedValue(updatedBuildingZone);

        await expect(buildingZoneService.downgradeBuildingZone(counterPerHabitat, habitatId)).resolves.toBe(updatedBuildingZone);
    });

    test('Should not downgrade level on building zone and throw exception when building zone not exists', async () => {
        const habitatId = 5;
        const counterPerHabitat = 1;

        const buildingZone = null;

        prismaMock.buildingZone.findFirst.calledWith(isEqual({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZone);

        await expect(buildingZoneService.downgradeBuildingZone(counterPerHabitat, habitatId)).rejects.toThrow(BuildingZoneUserInputError);
    });

    test('Should not downgrade level on building zone and throw exception when building zone exists but is not connected to any building', async () => {
        const habitatId = 5;
        const counterPerHabitat = 1;
        const buildingId = null;

        const buildingZone = {
            id: 5,
            habitatId: habitatId,
            buildingId: buildingId,
            level: 1,
            placement: 'fake',
            counterPerHabitat: counterPerHabitat
        };

        prismaMock.buildingZone.findFirst.calledWith(isEqual({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZone);

        await expect(buildingZoneService.downgradeBuildingZone(counterPerHabitat, habitatId)).rejects.toThrow(BuildingZoneUserInputError);
    });

    test('Should destroy one building zone when building zone exists', async () => {
        const habitatId = 5;
        const counterPerHabitat = 1;

        const buildingZone = {
            id: 5,
            habitatId: habitatId,
            buildingId: null,
            level: 1,
            placement: 'fake',
            counterPerHabitat: counterPerHabitat
        };

        prismaMock.buildingZone.findFirst.calledWith(isEqual({
            where: {
                counterPerHabitat: counterPerHabitat,
                habitatId: habitatId,
            }
        })).mockResolvedValue(buildingZone);

        prismaMock.buildingZone.delete.calledWith(isEqual({
            where: {
                id: buildingZone.id,
            }
        })).mockResolvedValue(buildingZone);

        await expect(buildingZoneService.destroyBuildingZone(counterPerHabitat, habitatId)).resolves.toBe(buildingZone);
    });

    test("Create as many building zones as is described in config", async () => {
        const habitatId = 5;
        const existingBuildingZones = [];


        prismaMock.buildingZone.findMany.calledWith(isEqual({
            where: {
                habitatId: habitatId
            }
        })).mockResolvedValue(existingBuildingZones);

        await buildingZoneService.createBuildingZoneOnNewHabitatCreation({id: habitatId} as Habitat);

        expect(prismaMock.buildingZone.create).toBeCalledTimes(config.buildingZones.counterForNewHabitat);
        expect(prismaMock.buildingZone.create.mock.lastCall[0].data.habitatId).toBe(habitatId);
    });
});
