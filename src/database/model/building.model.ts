import { BuildingRoleEnum } from "@warp-core/database/enum/building-role.enum";
import { BuildingDetailsAtCertainLevelModel } from "@warp-core/database/model/building-details-at-certain-level.model";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
    ArrayNotEmpty,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    ValidateNested,
    ValidatePromise
} from "class-validator";
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    OneToMany,
    PrimaryColumn
} from "typeorm";

@ObjectType({ description: "Single building type, describes its role in game" })
@Entity({name: "building"})
export class BuildingModel {
    @Field(() => ID)
    @IsString()
    @PrimaryColumn()
    id: string;

    @Field(() => BuildingRoleEnum, { description: "Role says what that building do" })
    @IsEnum(BuildingRoleEnum)
    @Column('varchar')
    role: BuildingRoleEnum;

    @Field({ description: "What name that kind of building have" })
    @Length(2, 255)
    @Column('varchar')
    name: string;

    @Field(
        () =>[BuildingDetailsAtCertainLevelModel],
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
