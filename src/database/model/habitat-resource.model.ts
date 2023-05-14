import { Field, ID, ObjectType } from "@nestjs/graphql";
import { HabitatModel } from "@warp-core/database/model/habitat.model";
import { ResourceModel } from "@warp-core/database/model/resource.model";
import { IsNumber, ValidateNested } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@ObjectType({ description: "Resource type, defines what kind of resources are in game"})
@Entity({name: "habitat-resource"})
export class HabitatResourceModel {
    @PrimaryGeneratedColumn()
    @Field(type => ID)
    id: string;

    @Field(type => HabitatModel, { description: "Habitat connected to that resource" })
    @ValidateNested()
    @ManyToOne(
        () => HabitatModel,
        (habitat) => habitat.habitatResources,
        {
            lazy: true,
        }
    )
    @JoinColumn({ name: 'habitatId' })
    habitat: HabitatModel | Promise<HabitatModel>;

    @Column({ name: 'habitatId' })
    habitatId: number;

    @Field({ description: "Current amount of the resources"})
    @IsNumber()
    currentAmount: number;
    
    @UpdateDateColumn()
    lastCalculationTime: Date;

    @Field(type => ResourceModel, { description: "Get connected resource details" })
    @ValidateNested()
    @ManyToOne(
        () => ResourceModel,
        {
            lazy: true
        }
    )
    @JoinColumn({ name: 'resourceId' })
    resource: ResourceModel | Promise<ResourceModel>;

    @Column({ name: 'resourceId' })
    resourceId: string;
}