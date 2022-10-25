import { Field, ArgsType, Int } from '@nestjs/graphql';

@ArgsType()
export class GetSingleBuildingZoneArgs {

    @Field((type) => Int, {description: "Habitat Id conneced to quered building zone"})
    habitatId: number;

    @Field((type) => Int, { description: "Building zone id counted for single habitat", name: "zoneId"})
    counterPerHabitat: number;
}