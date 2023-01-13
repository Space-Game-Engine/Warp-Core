import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, Length, ValidateNested } from "class-validator";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BuildingDetailsAtCertainLevelModel } from "./building-details-at-certain-level.model";
import { Role } from "./role.enum";

@ObjectType({ description: "Single building type, describes its role in game" })
@Entity({name: "building"})
export class BuildingModel {
    @Field(type => ID)
    @IsNumber()
    @IsOptional()
    @PrimaryGeneratedColumn()
    id: number;

    @Field(type => Role, { description: "Role says what that building do" })
    @IsEnum(Role)
    @Column('varchar')
    role: Role;

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
    @OneToMany(
        () => BuildingDetailsAtCertainLevelModel,
        (details) => details.building,
        {
            cascade: true,
            eager: true
        }
    )
    @Type(() => BuildingDetailsAtCertainLevelModel)
    buildingDetailsAtCertainLevel: BuildingDetailsAtCertainLevelModel[];
}
