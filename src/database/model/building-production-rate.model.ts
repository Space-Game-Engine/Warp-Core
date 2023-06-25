import { Field, ObjectType } from "@nestjs/graphql";
import { BuildingDetailsAtCertainLevelModel } from "@warp-core/database/model/building-details-at-certain-level.model";
import { ResourceModel } from "@warp-core/database/model/resource.model";
import { IsNumber, IsOptional, ValidateNested } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import {
    AbstractBuildingResourcesDetailsAtCertainLevel
} from "@warp-core/database/model/building-resources-details-at-certain-level.abstract-model";

@ObjectType({
    description: "Defines what kind of resources will be produced by that building",
    implements: () => [AbstractBuildingResourcesDetailsAtCertainLevel]
})
@Entity({ name: "building-production-rate" })
export class BuildingProductionRateModel extends AbstractBuildingResourcesDetailsAtCertainLevel {
    @Field({description: "Current level production rate"})
    @IsNumber()
    @Column()
    productionRate: number;
}