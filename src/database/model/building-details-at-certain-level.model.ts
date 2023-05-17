import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { BuildingProductionRateModel } from "@warp-core/database/model/building-production-rate.model";
import { BuildingModel } from "@warp-core/database/model/building.model";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, Min, ValidateNested, ValidatePromise } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Details how to upgrade single building" })
@Entity({ name: "building-details-at-certain-level" })
export class BuildingDetailsAtCertainLevelModel {
    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => BuildingModel, { description: "Building connected to that details" })
    @ManyToOne(
        () => BuildingModel,
        (building) => building.buildingDetailsAtCertainLevel,
        {
            lazy: true
        }
    )
    building: BuildingModel | Promise<BuildingModel>;

    @Field(() => Int, { description: "What level is described by this entry" })
    @IsNumber()
    @Min(1)
    @Column('int')
    level: number;

    @Field(() => Int, { description: "How much time it takes to upgrade that building" })
    @IsNumber()
    @Min(1)
    @Column('int')
    timeToUpdateBuildingInSeconds: number;

    @Field(
        () =>[BuildingProductionRateModel],
        {
            description: "Production rate for single building. There is possibility that single building can produce more than one resource.",
            nullable: true,
        }
    )
    @ValidateNested()
    @ValidatePromise()
    @IsOptional()
    @OneToMany(
        () => BuildingProductionRateModel, 
        (productionRate) => productionRate.buildingDetails,
        {
            lazy: true,
            nullable: true,
            persistence: false,
            cascade: true,
        }
    )
    @Type(() => BuildingProductionRateModel)
    productionRate?: BuildingProductionRateModel[] | Promise<BuildingProductionRateModel[]> | null;

    // @Field({description: "What should you do to make an upgrade"})
    // @Column("simple-json")
    // requirements: object;

    @BeforeInsert()
    @BeforeUpdate()
    async setOneToManyRelations() {
        const productionRates = await this.productionRate;
        for (const productionRate of productionRates) {
            if (!(await productionRate.buildingDetails)) {
                productionRate.buildingDetails = this;
            }
        }
    }
}
