import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsDate, IsNumber } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BuildingZoneModel } from "../../building-zone/model/building-zone.model";
import { BuildingModel } from "../../building/model/building.model";

@ObjectType({ description: "Defines one pending item in building queue" })
@Entity({ name: "building-queue-element" })
export class BuildingQueueElementModel {

    @Field(type => ID)
    @IsNumber()
    @PrimaryGeneratedColumn()
    id: number;

    @Field({ description: "What was level on queue start?" })
    @IsNumber()
    @Column('int')
    startLevel: number;

    @Field({ description: "What was level on queue end?" })
    @IsNumber()
    @Column('int')
    endLevel: number;

    @Field({ description: "At what time queue element will start?" })
    @IsDate()
    @Column('datetime')
    startTime: Date;

    @Field({ description: "At what time queue element will end?" })
    @IsDate()
    @Column('datetime')
    endTime: Date;

    @Field(type => [BuildingModel], { description: "Building connected to queue element" })
    @ManyToOne(() => BuildingModel)
    building: BuildingModel;

    @Field(type => BuildingZoneModel, { description: "Building zone connected to queue element" })
    @ManyToOne(() => BuildingZoneModel)
    buildingZone: BuildingZoneModel;
}