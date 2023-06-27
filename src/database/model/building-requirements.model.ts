import {
    AbstractBuildingResourcesDetailsAtCertainLevel
} from "@warp-core/database/model/building-resources-details-at-certain-level.abstract-model";
import { Field, ObjectType } from "@nestjs/graphql";
import { IsNumber } from "class-validator";
import { Column, Entity } from "typeorm";

@ObjectType({
    description: "Defines what resources are needed to build that building",
    implements: () => [AbstractBuildingResourcesDetailsAtCertainLevel]
})
@Entity({ name: "building-requirements" })
export class BuildingRequirementsModel extends AbstractBuildingResourcesDetailsAtCertainLevel {
    @Field({description: "Current level cost"})
    @IsNumber()
    @Column()
    cost: number;
}