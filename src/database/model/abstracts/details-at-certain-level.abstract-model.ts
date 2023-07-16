import {ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {IsNumber, IsOptional, ValidateNested} from "class-validator";
import {Field, InterfaceType} from "@nestjs/graphql";
import {BuildingDetailsAtCertainLevelModel} from "@warp-core/database";

@InterfaceType()
export abstract class AbstractDetailsAtCertainLevelModel {
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
}