import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsNumber } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BuildingZoneModel } from "../../building-zone/model/building-zone.model";

@ObjectType({ description: "Single habitat that belongs to user" })
@Entity({ name: "habitat" })
export class HabitatModel {
    @Field(type => ID)
    @IsNumber()
    @PrimaryGeneratedColumn()
    id: number;

    @Field({ description: "Custom name of the habitat" })
    @Column('varchar')
    name: string;

    @Field()
    @IsNumber()
    @Column('int')
    userId: number;

    @Field({ description: "Is that habitat a capital one" })
    @IsBoolean()
    @Column('boolean')
    isMain: boolean;

    @Field(type => [BuildingZoneModel])
    buildingZones: BuildingZoneModel[];

    // @Field(type => [BuildingQueueElement])
    // buildingQueue: BuildingQueueElement[]
}