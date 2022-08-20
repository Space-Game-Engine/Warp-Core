import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import * as path from "path";
import { buildSchema } from "type-graphql";
import { ApolloContext } from "./src/ApolloContext";
import { findFileNamesFromGlob } from "type-graphql/dist/helpers/loadResolversFromGlob";
import { EventListener } from "./src/EventListener";
import Container from "./src/PrepareDIContainer";


async function bootstrap(): Promise<void> {
    // build TypeGraphQL executable schema
    const schema = await buildSchema({
        resolvers: [__dirname + "/src/**/*Resolver.ts"],
        // automatically create `schema.gql` file with schema definition in current folder
        emitSchemaFile: path.resolve(__dirname, "schema.gql"),
        container: Container,
    });

    // Automatically launch all listeners
    const listenerFilesNames = findFileNamesFromGlob(__dirname + "/src/**/*Listener.ts");
    const listenerObjects: Array<EventListener> = [];
    for (const singleListenerFileName of listenerFilesNames) {
        const listenerName = await require(singleListenerFileName);

        if (!listenerName.default) {
            continue;
        }

        const singleListenerObject: EventListener = Container.get(listenerName.default);
        singleListenerObject.registerAllListeners();

        listenerObjects.push(singleListenerObject);
    }

    // Create GraphQL server
    const server = new ApolloServer({
        schema,
        context: (): ApolloContext => ({
            prisma: Container.get("PRISMA"),
            listeners: listenerObjects
        }),
        // enable GraphQL Playground
        // playground: true,
    });

    // Start the server
    const { url } = await server.listen(4000);
    console.log(`Server is running, GraphQL Playground available at ${url}`);
}

bootstrap().catch(console.error);
