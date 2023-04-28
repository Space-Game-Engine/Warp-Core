import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { IsNumber, Min } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Details how to upgrade single building" })
@Entity({ name: "building-details-at-certain-level" })
export class BuildingDetailsAtCertainLevelModel {
    @Field(type => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(type => BuildingModel, { description: "Building connected to that details" })
    @ManyToOne(() => BuildingModel, (building) => building.buildingDetailsAtCertainLevel)
    building: BuildingModel | Promise<BuildingModel>;

    @Field(type => Int, { description: "What level is described by this entry" })
    @IsNumber()
    @Min(1)
    @Column('int')
    level: number;

    @Field(type => Int, { description: "How much time it takes to upgrade that building" })
    @IsNumber()
    @Min(1)
    @Column('int')
    timeToUpdateBuildingInSeconds: number;

    // @Field({description: "What should you do to make an upgrade"})
    // @Column("simple-json")
    // requirements: object;
}
