import { Field, ObjectType } from "@nestjs/graphql";
import { BuildingDetailsAtCertainLevelModel } from "@warp-core/database/model/building-details-at-certain-level.model";
import { ResourceModel } from "@warp-core/database/model/resource.model";
import { IsNumber, IsOptional, ValidateNested } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {
    AbstractBuildingResourcesDetailsAtCertainLevel
} from "@warp-core/database/model/building-resources-details-at-certain-level.abstract-model";

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