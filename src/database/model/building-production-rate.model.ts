import { Field, ObjectType } from "@nestjs/graphql";
import { BuildingDetailsAtCertainLevelModel } from "@warp-core/database/model/building-details-at-certain-level.model";
import { ResourceModel } from "@warp-core/database/model/resource.model";
import { IsNumber, IsOptional, ValidateNested } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Defines what kind of resources will be produced by that building" })
@Entity({ name: "building-production-rate" })
export class BuildingProductionRateModel {
    @PrimaryGeneratedColumn()
    @IsNumber()
    @IsOptional()
    id: number;

    @Field(() => BuildingDetailsAtCertainLevelModel, { description: "Details how to upgrade that building" })
    @ValidateNested()
    @ManyToOne(
        () => BuildingDetailsAtCertainLevelModel,
        (buildingDetails) => buildingDetails.productionRate,
        {
            lazy: true
        }
    )
    buildingDetails: BuildingDetailsAtCertainLevelModel | Promise<BuildingDetailsAtCertainLevelModel>;

    @Field(() => ResourceModel, { description: "Get connected resource details" })
    @ManyToOne(
        () => ResourceModel,
        {
            lazy: true
        }
    )
    @JoinColumn({ name: 'resourceId' })
    resource: ResourceModel | Promise<ResourceModel>;

    @Column({ name: 'resourceId' })
    resourceId: string;

    @Field({description: "Current level production rate"})
    @IsNumber()
    @Column()
    productionRate: number;
}