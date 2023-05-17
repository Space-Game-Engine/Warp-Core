import { IntersectionType, ObjectType, OmitType } from "@nestjs/graphql";
import { HabitatResourceModel } from "@warp-core/database/model/habitat-resource.model";
import { ResourceModel } from "@warp-core/database/model/resource.model";

@ObjectType()
export class HabitatResourceCombined extends IntersectionType (
    ResourceModel,
    OmitType(HabitatResourceModel, [
        'id',
        'lastCalculationTime',
        'resource',
    ] as const),
) {}