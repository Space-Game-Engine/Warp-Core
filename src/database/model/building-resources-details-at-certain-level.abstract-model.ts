import { BuildingDetailsAtCertainLevelModel } from "@warp-core/database/model/building-details-at-certain-level.model";
import { ResourceModel } from "@warp-core/database/model/resource.model";
import { Field, InterfaceType } from "@nestjs/graphql";
import { IsNumber, IsOptional, ValidateNested } from "class-validator";
import { Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@InterfaceType()
export abstract class AbstractBuildingResourcesDetailsAtCertainLevel {
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
}