import {AddToQueueInput} from "@warp-core/building-queue/input/add-to-queue.input";
import {
    BuildingModel,
    BuildingZoneModel,
    QueueElementCostModel,
    ResourceModel,
    ResourceTypeEnum
} from "@warp-core/database";
import {
    ResourcesCalculatorInterface
} from "@warp-core/building-queue/add/calculate-resources/resources-calculator.interface";
import {Injectable} from "@nestjs/common";

@Injectable()
export class SimpleCalculationService implements ResourcesCalculatorInterface {
    async calculateResourcesCosts(addToQueueElement: AddToQueueInput, buildingZone: BuildingZoneModel, building: BuildingModel): Promise<QueueElementCostModel[]> {
        const queueCost = new Map<string, QueueElementCostModel>();

        const allBuildingDetails = await building.buildingDetailsAtCertainLevel;
        const buildingDetailsForUpdate = allBuildingDetails.filter((buildingDetails) => {
            return buildingDetails.level > buildingZone.level && buildingDetails.level <=addToQueueElement.endLevel
        });

        for (const buildingDetailsForUpdateElement of buildingDetailsForUpdate) {
            const buildingUpdateCosts = await buildingDetailsForUpdateElement.requirements;

            for (const buildingUpdateCost of buildingUpdateCosts) {
                const resource = await buildingUpdateCost.resource;

                if (resource.type !== ResourceTypeEnum.CONSTRUCTION_RESOURCE) {
                    continue;
                }
                this.addToQueueCost(queueCost, resource, buildingUpdateCost.cost);

            }
        }

        return Array.from(queueCost, ([resourceName, cost]) => (cost));
    }

    private addToQueueCost(queueCost: Map<string, QueueElementCostModel>, resource: ResourceModel, cost: number) {
        let queueCostPerResource: QueueElementCostModel;

        if (queueCost.has(resource.id) === true) {
            queueCostPerResource = queueCost.get(resource.id);
        } else {
            queueCostPerResource = new QueueElementCostModel();
            queueCostPerResource.resource = resource;
            queueCostPerResource.cost = 0;
        }

        queueCostPerResource.cost += cost;

        queueCost.set(resource.id, queueCostPerResource);
    }
}