import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import * as path from "path";
import { buildSchema } from "type-graphql";
import { PrismaClient } from "@prisma/client";

import { ApolloContext } from "./src/ApolloContext";
import { HabitatResolver } from "./src/habitat/HabitatResolver";

async function bootstrap() {
    // build TypeGraphQL executable schema
    const schema = await buildSchema({
        resolvers: [HabitatResolver],
        // automatically create `schema.gql` file with schema definition in current folder
        emitSchemaFile: path.resolve(__dirname, "schema.gql"),
    });

    const prisma = new PrismaClient();

    // Create GraphQL server
    const server = new ApolloServer({
        schema,
        context: (): ApolloContext => ({ prisma }),
        // enable GraphQL Playground
        // playground: true,
    });

    // Start the server
    const { url } = await server.listen(4000);
    console.log(`Server is running, GraphQL Playground available at ${url}`);
}

bootstrap().catch(console.error);