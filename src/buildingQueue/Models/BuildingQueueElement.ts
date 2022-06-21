import {Field, ID, ObjectType} from "type-graphql";
import {Building} from "../../building/Models/Building";
import {BuildingZone} from "../../buildingZone/Models/BuildingZone";

@ObjectType({description: "Defines one pending item in building queue"})
export class BuildingQueueElement {

    @Field(type => ID)
    id: number;

    @Field({description: "What was level on queue start?"})
    startLevel: number;

    @Field({description: "What was level on queue end?"})
    endLevel: number;

    @Field({description: "At what time queue element will start?"})
    startTime: Date;

    @Field({description: "At what time queue element will end?"})
    endTime: Date;

    @Field(type => Building, {description: "Building connected to queue element"})
    building: Building;

    buildingId: number;

    @Field(type => BuildingZone, {description: "Building zone connected to queue element"})
    buildingZone: BuildingZone;

    buildingZoneId: number;
}
