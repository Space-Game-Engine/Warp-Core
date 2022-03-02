import {
    Resolver,
    Query,
    FieldResolver,
    Arg,
    Root,
    Mutation,
    Int,
    ResolverInterface,
} from "type-graphql";

import { Habitat } from "./Habitat";

@Resolver(Habitat)
export class HabitatResolver {
    // constructor(private recipeService: RecipeService) { }

    @Query(returns => Habitat)
    habitat(@Arg("id") id: number) {
        const habitat = new Habitat();
        habitat.id = id;
        habitat.name = "lorem ipsum";
        habitat.isMain = true;
        // if (recipe === undefined) {
        //     throw new RecipeNotFoundError(id);
        // }
        return habitat;
    }
/*
    @Query(returns => [Recipe])
    recipes(@Args() { skip, take }: RecipesArgs) {
        return this.recipeService.findAll({ skip, take });
    }

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