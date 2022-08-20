import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import * as path from "path";
import { buildSchema } from "type-graphql";
import { AppContext } from "./src/core/AppContext";
import { prepareAppContext } from "./src/core/bootstrap/PrepareAppContext";


async function bootstrap(): Promise<void> {
    const appContext = await prepareAppContext();
    // build TypeGraphQL executable schema
    const schema = await buildSchema({
        resolvers: [__dirname + "/src/**/*Resolver.ts"],
        // automatically create `schema.gql` file with schema definition in current folder
        emitSchemaFile: path.resolve(__dirname, "schema.gql"),
        container: appContext.container,
    });

    // Create GraphQL server
    const server = new ApolloServer({
        schema,
        context: (): AppContext => (appContext),
        // enable GraphQL Playground
        // playground: true,
    });

    // Start the server
    const { url } = await server.listen(4000);
    console.log(`Server is running, GraphQL Playground available at ${url}`);
}

bootstrap().catch(console.error);
