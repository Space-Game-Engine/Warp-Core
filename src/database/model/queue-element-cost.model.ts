import {ResourceModel} from "@warp-core/database";
import {Field, ObjectType} from "@nestjs/graphql";

@ObjectType({description: "Detailed information with resources required be used in queue."})
export class QueueElementCostModel {

    @Field(() => ResourceModel)
    resource: ResourceModel;

    @Field({description: 'Resources used for that queue element'})
    cost: number;
}