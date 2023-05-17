import { Field, ID, ObjectType } from "@nestjs/graphql";
import { BuildingZoneModel } from "@warp-core/database/model/building-zone.model";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { IsBoolean, IsDate, IsNumber } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Defines one pending item in building queue" })
@Entity({ name: "building-queue-element" })
export class BuildingQueueElementModel {

    @Field(() => ID)
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

    @IsBoolean()
    @Column('boolean')
    isConsumed: boolean = false;

    @Field(() => BuildingModel, { nullable: true, description: "Building connected to queue element" })
    @ManyToOne(
        () => BuildingModel,
        {
            lazy: true,
        }
    )
    @JoinColumn({ name: 'buildingId' })
    building?: BuildingModel | Promise<BuildingModel>;

    @Column({ nullable: true })
    buildingId?: number;

    @Field(() => BuildingZoneModel, { description: "Building zone connected to queue element" })
    @ManyToOne(
        () => BuildingZoneModel,
        (buildingZone) => buildingZone.buildingQueue,
        {
            lazy: true
        }
    )
    @JoinColumn({ name: 'buildingZoneId' })
    buildingZone: BuildingZoneModel | Promise<BuildingZoneModel>;

    @Column()
    buildingZoneId?: number;
}