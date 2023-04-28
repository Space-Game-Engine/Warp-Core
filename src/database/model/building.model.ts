import { Field, ID, ObjectType } from "@nestjs/graphql";
import { BuildingRole } from "@warp-core/database/enum/building-role.enum";
import { BuildingDetailsAtCertainLevelModel } from "@warp-core/database/model/building-details-at-certain-level.model";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, Length, ValidateNested } from "class-validator";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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
    @OneToMany(
        () => BuildingDetailsAtCertainLevelModel,
        (details) => details.building,
    )
    @Type(() => BuildingDetailsAtCertainLevelModel)
    buildingDetailsAtCertainLevel: BuildingDetailsAtCertainLevelModel[] | Promise<BuildingDetailsAtCertainLevelModel[]>;
}
