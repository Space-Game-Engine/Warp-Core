import { Field, ID, ObjectType } from "@nestjs/graphql";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { IsDate, IsNumber } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Defines one pending item in building queue" })
@Entity({ name: "building-queue-element" })
export class BuildingQueueElementModel {

    @Field(type => ID)
    @IsNumber()
    @PrimaryGeneratedColumn()
    id?: number;

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

    @Field(type => BuildingModel, { description: "Building connected to queue element" })
    @ManyToOne(() => BuildingModel,
        {
            cascade: true,
            eager: true
        }
    )
    building: BuildingModel;

    @Field(type => BuildingZoneModel, { description: "Building zone connected to queue element" })
    @ManyToOne(() => BuildingZoneModel)
    buildingZone: BuildingZoneModel;
}