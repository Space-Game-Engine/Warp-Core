import {BuildingDetailsAtCertainLevelModel} from "@warp-core/database/model/building-details-at-certain-level.model";
import {ResourceModel} from "@warp-core/database/model/resource.model";
import {Field, InterfaceType} from "@nestjs/graphql";
import {IsNumber, IsOptional, ValidateNested} from "class-validator";
import {Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {
    AbstractDetailsAtCertainLevelModel
} from "@warp-core/database/model/abstracts/details-at-certain-level.abstract-model";

@InterfaceType()
export abstract class AbstractBuildingResourcesDetailsAtCertainLevel extends AbstractDetailsAtCertainLevelModel {
    @Field(() => ResourceModel, {description: "Get connected resource details"})
    @ManyToOne(
        () => ResourceModel,
        {
            lazy: true
        }
    )
    @JoinColumn({name: 'resourceId'})
    resource: ResourceModel | Promise<ResourceModel>;

    @Column({name: 'resourceId'})
    resourceId: string;
}