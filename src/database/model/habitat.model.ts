import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsNumber } from "class-validator";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AuthModelInterface } from "@warp-core/auth/interface/auth-model.interface";
import { BuildingZoneModel } from "./building-zone.model";
import { BuildingQueueElementModel } from "@warp-core/database/model/building-queue-element.model";
import { HabitatResourceModel } from "@warp-core/database/model/habitat-resource.model";
import { HabitatResourceCombined } from "@warp-core/database/model/habitat-resource.mapped.model";

@ObjectType({ description: "Single habitat that belongs to user" })
@Entity({ name: "habitat" })
export class HabitatModel implements AuthModelInterface {
    @Field(() => ID)
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

    @Field(() =>[BuildingZoneModel])
    @OneToMany(
        () => BuildingZoneModel,
        (buildingZone) => buildingZone.habitat,
        {
            lazy: true
        }
    )
    buildingZones: BuildingZoneModel[] | Promise<BuildingZoneModel[]>;

    @Field(() => [HabitatResourceCombined])
    @OneToMany(
        () => HabitatResourceModel,
        (habitatResource) => habitatResource.habitat,
        {
            lazy: true
        }
    )
    habitatResources: HabitatResourceModel[] | Promise<HabitatResourceModel[]>;

    @Field(() =>[BuildingQueueElementModel])
    @OneToMany(
        () => BuildingQueueElementModel,
        async (queueElement) => (await queueElement.buildingZone).habitat,
        {
            lazy: true
        }
    )
    buildingQueue: BuildingQueueElementModel[] | Promise<BuildingQueueElementModel[]>;

    getAuthId(): any {
        return this.id;
    }
}