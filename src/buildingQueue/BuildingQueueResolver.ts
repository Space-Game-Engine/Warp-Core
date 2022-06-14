import {Service} from "typedi";
import {Arg, Int, Query, Resolver} from "type-graphql";
import {BuildingQueueElement} from "./Models/BuildingQueueElement";

@Service()
@Resolver(of => BuildingQueueElement)
export class BuildingQueueResolver {

    constructor() {
    }

    @Query(returns => [BuildingQueueElement], {description: "Returns whole queue for userId"})
    buildingQueueForUser(
        @Arg('userId', type => Int) userId: number
    ) {


    }

}
