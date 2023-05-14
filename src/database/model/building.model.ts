import { Field, ID, ObjectType } from "@nestjs/graphql";
import { BuildingRole } from "@warp-core/database/enum/building-role.enum";
import { BuildingDetailsAtCertainLevelModel } from "@warp-core/database/model/building-details-at-certain-level.model";
import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsEnum, IsNumber, IsOptional, Length, ValidateNested, ValidatePromise } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@ObjectType({ description: "Single building type, describes its role in game" })
@Entity({name: "building"})
export class BuildingModel {
    @Field(type => ID)
    @IsNumber()
    @IsOptional()
    @PrimaryGeneratedColumn()
    id: number;

    @Field(type => BuildingRole, { description: "Role says what that building do" })
    @IsEnum(BuildingRole)
    @Column('varchar')
    role: BuildingRole;

    @Field({ description: "What name that kind of building have" })
    @Length(2, 255)
    @Column('varchar')
    name: string;

    @Field(
        type => [BuildingDetailsAtCertainLevelModel],
        {
            description: "Details how to upgrade that building",
        })
    @ValidateNested()
    @ValidatePromise()
    @ArrayNotEmpty()
    @OneToMany(
        () => BuildingDetailsAtCertainLevelModel,
        (details) => details.building,
        {
            lazy: true,
            persistence: false,
            cascade: true,
        }
    )
    @JoinColumn({ name: "buildingDetailsAtCertainLevelId"})
    @Type(() => BuildingDetailsAtCertainLevelModel)
    @Transform(({ value }) => {
        // If the value is a Promise, we want to await it
        if (value instanceof Promise) {
            return value.then((result) => result || []);
        }
        // Otherwise, the value is already an array
        return value || [];
    }, { toClassOnly: true })
    buildingDetailsAtCertainLevel: BuildingDetailsAtCertainLevelModel[] | Promise<BuildingDetailsAtCertainLevelModel[]>;

    @BeforeInsert()
    @BeforeUpdate()
    async setOneToManyRelations() {
        const buildingDetails = await this.buildingDetailsAtCertainLevel;
        for (const buildingDetail of buildingDetails) {
            if (! (await buildingDetail.building)) {
                buildingDetail.building = this;
            }
        }
    }
}
