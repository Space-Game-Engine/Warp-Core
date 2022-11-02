import { Field, ObjectType } from "@nestjs/graphql";
import { IsNumber, Min, ValidateNested } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BuildingModel } from "../../building/model/building.model";
import { HabitatModel } from "../../habitat/model/habitat.model";

@ObjectType({ description: "Single building zone, you can build here single building and level it up" })
@Entity({ name: "building-zone" })
export class BuildingZoneModel {

    /**
     * Minimal level with created building on that zone
     */
    static readonly MINIMAL_BUILDING_LEVEL = 1;

    // Real Id of building zone
    @IsNumber()
    @PrimaryGeneratedColumn()
    id: number;

    @Field({ description: "Building zone id counted for single habitat", name: "zoneId" })
    @IsNumber()
    @Column('int')
    counterPerHabitat: number;

    @Field(type => HabitatModel, { description: "Habitat connected to that building zone" })
    @ValidateNested()
    @ManyToOne(() => HabitatModel, (habitat) => habitat.buildingZones)
    @JoinColumn({ name: 'habitatId' })
    habitat: HabitatModel;

    @Column({ name: 'habitatId' })
    habitatId: number;

    @Field(type => BuildingModel, { nullable: true, description: "What kind of building is placed here" })
    @ManyToOne(() => BuildingModel)
    @JoinColumn({ name: 'buildingId' })
    building?: BuildingModel;

    @Column({ name: 'buildingId', nullable: true})
    buildingId?: number;

    @Field({ description: "What level is that" })
    @IsNumber()
    @Min(0)
    @Column('int')
    level: number = 0;

    @Field({ nullable: true, description: "Where is that building zone placed in our habitat" })
    @Column('simple-json')
    placement?: string;

    // @Field(type => [BuildingQueueElement], { description: "List of all queues connected to that building zone" })
    // buildingQueue?: BuildingQueueElement[];

}