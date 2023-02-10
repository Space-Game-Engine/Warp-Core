import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsNumber } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AuthModelInterface } from "../../auth/interface/auth-model.interface";
import { BuildingQueueElementModel } from "../../building-queue/model/building-queue-element.model";
import { BuildingZoneModel } from "../../building-zone/model/building-zone.model";

@ObjectType({ description: "Single habitat that belongs to user" })
@Entity({ name: "habitat" })
export class HabitatModel implements AuthModelInterface {
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

    @Field(type => [BuildingQueueElementModel])
    buildingQueue: BuildingQueueElementModel[];

    getAuthId(): any {
        return this.id;
    }
}