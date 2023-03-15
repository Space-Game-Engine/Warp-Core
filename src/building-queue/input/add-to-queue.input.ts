
import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { BuildingZoneExists } from "@warp-core/building-queue/input/validator/building-zone-exists.validator";
import { IsBuildingIdProvided } from "@warp-core/building-queue/input/validator/is-building-id-provided.validator";
import { IsBuildingIdValid } from "@warp-core/building-queue/input/validator/is-building-id-valid.validator";
import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";

@InputType({description: "Creates new element in queue"})
export class AddToQueueInput extends PartialType(BuildingQueueElementModel)
{
    @Field(type => Int,{description: "Local Id of building zone", name: "buildingZoneId"})
    @BuildingZoneExists()
    counterPerHabitat: number;

    @Field(type => Int, {
        description: "Id of building type that will be constructed. If building is already placed, that field will be ignored"
    })
    @IsBuildingIdProvided()
    @IsBuildingIdValid()
    buildingId?: number;

    @Field(type => Int, {description: "How much levels will be build"})
    endLevel: number;
}
