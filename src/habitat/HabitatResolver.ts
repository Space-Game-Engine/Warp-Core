import {
    Resolver,
    Query,
    Arg,
    Ctx,
    Mutation,
} from "type-graphql";
import { ApolloContext } from "../ApolloContext";
import { Service } from "typedi";

import { Habitat } from "./Habitat";
import { HabitatService } from "./HabitatService";
import { NewHabitatInput } from "./NewHabitatInput";

@Service()
@Resolver(Habitat)
export class HabitatResolver {
    constructor(
        private readonly habitatService: HabitatService
    ){}

    @Query(returns => Habitat, { nullable: true, description: "Get single habitat by its id" })
    habitat(
        @Arg("id") id: number
    ) {
        return this.habitatService.getHabitatById(id);
    }

    @Query(returns => [Habitat], { nullable: true, description: "Get all habitats for single user id" })
    userHabitats(
        @Arg("userId") id: number,
        @Ctx() context: ApolloContext
    ) {
        return context.prisma.habitat.findMany({
            where: {
                userId: id
            }
        });
    }

    @Mutation(returns => Habitat, {description: "Create new habitat for single user"})
    async addHabitat(
        @Arg('newHabitatData') newHabitatData: NewHabitatInput,
        @Ctx() context: ApolloContext
    ) {
        const newHabitat = context.prisma.habitat.create({
            data: {
                userId: newHabitatData.userId,
                name: newHabitatData.name,
                isMain: newHabitatData.isMain,
            }
        });

        return newHabitat;
    }
}