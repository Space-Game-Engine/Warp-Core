import {
    Resolver,
    Query,
    Arg,
    Ctx,
} from "type-graphql";
import { ApolloContext } from "../ApolloContext";

import { Habitat } from "./Habitat";

@Resolver(Habitat)
export class HabitatResolver {
    // constructor(private recipeService: RecipeService) { }

    @Query(returns => Habitat, { nullable: true })
    habitat(
        @Arg("id") id: number,
        @Ctx() context: ApolloContext
    ) {
        return context.prisma.habitat.findFirst({
            where: {
                id: id
            }
        });
    }

    @Query(returns => [Habitat], { nullable: true })
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
/*

    @Mutation(returns => Recipe)
    @Authorized()
    addRecipe(
        @Arg("newRecipeData") newRecipeData: NewRecipeInput,
        @Ctx("user") user: User,
    ): Promise<Recipe> {
        return this.recipeService.addNew({ data: newRecipeData, user });
    }

    @Mutation(returns => Boolean)
    @Authorized(Roles.Admin)
    async removeRecipe(@Arg("id") id: string) {
        try {
            await this.recipeService.removeById(id);
            return true;
        } catch {
            return false;
        }
    }*/
}