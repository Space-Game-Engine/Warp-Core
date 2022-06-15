import "reflect-metadata";
import {ApolloServer} from "apollo-server";
import * as path from "path";
import {buildSchema} from "type-graphql";
import {PrismaClient} from "@prisma/client";
import {Container} from "typedi";
import {ApolloContext} from "./src/ApolloContext";
import {resolvers} from "./src/Resolvers";

const config = require('config');

const prisma = new PrismaClient();
Container.set({id: "PRISMA", factory: () => prisma});
Container.set({id: "CONFIG", factory: () => config});

async function bootstrap() {
    // build TypeGraphQL executable schema
    const schema = await buildSchema({
        resolvers: resolvers,
        // automatically create `schema.gql` file with schema definition in current folder
        emitSchemaFile: path.resolve(__dirname, "schema.gql"),
        container: Container,
    });

    // Create GraphQL server
    const server = new ApolloServer({
        schema,
        context: (): ApolloContext => ({ prisma: Container.get("PRISMA") }),
        // enable GraphQL Playground
        // playground: true,
    });

    // Start the server
    const { url } = await server.listen(4000);
    console.log(`Server is running, GraphQL Playground available at ${url}`);
}

bootstrap().catch(console.error);
