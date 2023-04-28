import { Field, ObjectType } from "@nestjs/graphql";
import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { IsNumber, Min, ValidateNested } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

    @Field({ description: "Building zone id counted for single habitat"})
    @IsNumber()
    @Column('int')
    localBuildingZoneId: number;

    @Field(type => HabitatModel, { description: "Habitat connected to that building zone" })
    @ValidateNested()
    @ManyToOne(
        () => HabitatModel,
        (habitat) => habitat.buildingZones,
        {
            lazy: true,
        }
    )
    @JoinColumn({ name: 'habitatId' })
    habitat: HabitatModel |  Promise<HabitatModel>;

    @Column({ name: 'habitatId' })
    habitatId: number;

    @Field(type => BuildingModel, { nullable: true, description: "What kind of building is placed here" })
    @ManyToOne(
        () => BuildingModel,
        {
            lazy: true,
        }
    )
    @JoinColumn({ name: 'buildingId' })
    building?: BuildingModel | Promise<BuildingModel>;

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

    @Field(type => [BuildingQueueElementModel], { description: "List of all queues connected to that building zone" })
    @OneToMany(
        () => BuildingQueueElementModel,
        (buildingQueue) => buildingQueue.buildingZone,
        {
            lazy: true
        }
    )
    buildingQueue: BuildingQueueElementModel[] | Promise<BuildingQueueElementModel[]>;

}